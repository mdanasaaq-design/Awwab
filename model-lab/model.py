"""Small randomly initialized causal decoder-only Transformer (PyTorch required)."""
from __future__ import annotations

try:
    import torch
    from torch import nn
except ImportError as exc:  # no implicit installation
    raise RuntimeError(
        "Awwab Model Lab training requires PyTorch 2.x. Install it explicitly in a virtual environment; "
        "this project never installs packages or downloads weights automatically."
    ) from exc

from tokenizer import TOKENIZER_VERSION, VOCAB_SIZE

MODEL_FORMAT_VERSION = 1


class ModelConfig:
    def __init__(self, *, vocab_size: int = VOCAB_SIZE, d_model: int = 64,
                 n_heads: int = 2, n_layers: int = 2, max_seq_len: int = 128,
                 dropout: float = 0.0):
        if d_model <= 0 or n_heads <= 0 or n_layers <= 0 or max_seq_len < 2:
            raise ValueError("model dimensions must be positive and max_seq_len >= 2")
        if d_model % n_heads:
            raise ValueError("d_model must be divisible by n_heads")
        if vocab_size != VOCAB_SIZE:
            raise ValueError("vocab_size must match the versioned byte tokenizer")
        if not 0.0 <= dropout < 1.0:
            raise ValueError("dropout must be in [0, 1)")
        self.vocab_size = vocab_size
        self.d_model = d_model
        self.n_heads = n_heads
        self.n_layers = n_layers
        self.max_seq_len = max_seq_len
        self.dropout = dropout

    def to_dict(self) -> dict:
        return {
            "vocab_size": self.vocab_size, "d_model": self.d_model,
            "n_heads": self.n_heads, "n_layers": self.n_layers,
            "max_seq_len": self.max_seq_len, "dropout": self.dropout,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "ModelConfig":
        expected = {"vocab_size", "d_model", "n_heads", "n_layers", "max_seq_len", "dropout"}
        if set(data) != expected:
            raise ValueError("checkpoint model configuration has unexpected fields")
        return cls(**data)


class CausalSelfAttentionBlock(nn.Module):
    def __init__(self, config: ModelConfig):
        super().__init__()
        self.norm1 = nn.LayerNorm(config.d_model)
        self.attention = nn.MultiheadAttention(
            config.d_model, config.n_heads, dropout=config.dropout, batch_first=True
        )
        self.norm2 = nn.LayerNorm(config.d_model)
        self.feed_forward = nn.Sequential(
            nn.Linear(config.d_model, 4 * config.d_model),
            nn.GELU(),
            nn.Linear(4 * config.d_model, config.d_model),
            nn.Dropout(config.dropout),
        )

    def forward(self, x):
        sequence_length = x.size(1)
        # True means masked in PyTorch: token t cannot attend to future positions.
        causal_mask = torch.triu(
            torch.ones(sequence_length, sequence_length, dtype=torch.bool, device=x.device),
            diagonal=1,
        )
        normalized = self.norm1(x)
        attended, _ = self.attention(
            normalized, normalized, normalized, attn_mask=causal_mask, need_weights=False
        )
        x = x + attended
        return x + self.feed_forward(self.norm2(x))


class AwwabTransformer(nn.Module):
    """Decoder-only language model; all parameters are initialized from scratch."""
    def __init__(self, config: ModelConfig):
        super().__init__()
        self.config = config
        self.token_embedding = nn.Embedding(config.vocab_size, config.d_model)
        self.position_embedding = nn.Embedding(config.max_seq_len, config.d_model)
        self.blocks = nn.ModuleList([CausalSelfAttentionBlock(config) for _ in range(config.n_layers)])
        self.final_norm = nn.LayerNorm(config.d_model)
        self.lm_head = nn.Linear(config.d_model, config.vocab_size, bias=False)
        # Tie token input/output weights to reduce parameters; no pretrained values are loaded.
        self.lm_head.weight = self.token_embedding.weight
        self.apply(self._initialize)

    @staticmethod
    def _initialize(module):
        if isinstance(module, (nn.Linear, nn.Embedding)):
            nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if isinstance(module, nn.Linear) and module.bias is not None:
                nn.init.zeros_(module.bias)
        elif isinstance(module, nn.LayerNorm):
            nn.init.ones_(module.weight)
            nn.init.zeros_(module.bias)

    def forward(self, token_ids):
        if token_ids.ndim != 2:
            raise ValueError("token_ids must have shape [batch, sequence]")
        if token_ids.size(1) > self.config.max_seq_len:
            raise ValueError("sequence exceeds configured max_seq_len")
        positions = torch.arange(token_ids.size(1), device=token_ids.device)
        x = self.token_embedding(token_ids) + self.position_embedding(positions)[None, :, :]
        for block in self.blocks:
            x = block(x)
        return self.lm_head(self.final_norm(x))

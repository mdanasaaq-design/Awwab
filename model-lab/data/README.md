# Local training data

Keep actual datasets local and out of Git. Each JSONL record must contain text, source, and license fields. Review the data rights and privacy before training. Do not use private conversations, personal memories, secrets, or scraped data with unclear rights. The synthetic fixture can be generated with `python model-lab/data.py --write-synthetic model-lab/data/synthetic.jsonl`; it is intentionally not committed as a training corpus.


## Open-source training-code reuse

Awwab may adapt training-loop, batching, optimizer, checkpoint and evaluation code from LitGPT (Apache-2.0) or nanoGPT (MIT) after exact-file review. This does not permit importing their pretrained model weights or datasets. Awwab model training must start from random initialization. Keep source provenance/licence records in the repository's `THIRD_PARTY_NOTICES.md` and the detailed [reuse catalogue](../../docs/OPEN_SOURCE_REUSE_CATALOG.md).

# Local training data

Keep actual datasets local and out of Git. Each JSONL record must contain text, source, and license fields. Review the data rights and privacy before training. Do not use private conversations, personal memories, secrets, or scraped data with unclear rights. The synthetic fixture can be generated with `python model-lab/data.py --write-synthetic model-lab/data/synthetic.jsonl`; it is intentionally not committed as a training corpus.

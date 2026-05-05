from sdv.single_table import GaussianCopulaSynthesizer
from sdv.metadata import SingleTableMetadata
from datasets import load_dataset
import os

def generate_data():
    print("🚀 [Agricultural AX] Open-Source Synthetic Data Generation using SDV (Synthetic Data Vault)")
    
    # 1. Fetch real dataset from Hugging Face
    dataset_name = "jason1966/aksahaha_crop-recommendation"
    print(f"📥 Loading real agricultural dataset from Hugging Face: {dataset_name}")
    try:
        dataset = load_dataset(dataset_name, split="train")
        df = dataset.to_pandas()
    except Exception as e:
        print(f"❌ Failed to fetch dataset from Hugging Face: {e}")
        return

    # To keep it manageable, we'll take a sample
    if len(df) > 1000:
        df = df.sample(n=1000, random_state=42).reset_index(drop=True)
    else:
        df = df.copy()
    
    print("--- Original Sample Data (Real World) ---")
    print(df.head())
    print(f"Total Rows: {len(df)}, Columns: {list(df.columns)}")
    
    # 2. Detect Metadata
    metadata = SingleTableMetadata()
    metadata.detect_from_dataframe(df)
    
    # 3. Initialize and train the open-source synthesizer
    print("\n🧠 Training GaussianCopulaSynthesizer on the real dataset...")
    synthesizer = GaussianCopulaSynthesizer(metadata)
    synthesizer.fit(df)
    
    # 4. Generate synthetic data
    print("\n⏳ Generating 1000 synthetic rows to augment our Agricultural AI model...")
    synthetic_data = synthesizer.sample(num_rows=1000)
    
    # 5. Save to CSV
    os.makedirs('docs/test_data', exist_ok=True)
    output_path = 'docs/test_data/synthetic_agriculture_yield.csv'
    synthetic_data.to_csv(output_path, index=False)
    
    print("\n--- Snippet of Generated Synthetic Data ---")
    print(synthetic_data.head())
    print(f"\n✅ Successfully generated and saved to {output_path}")

if __name__ == "__main__":
    generate_data()

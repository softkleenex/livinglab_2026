import pandas as pd
from sdv.single_table import GaussianCopulaSynthesizer
from sdv.metadata import SingleTableMetadata
import os

def generate_data():
    print("🚀 [Agricultural AX] Open-Source Synthetic Data Generation using SDV (Synthetic Data Vault)")
    
    # 1. Create a dummy initial dataset mimicking Weather + Yield data
    data = {
        'region': ['대구광역시 북구', '대구광역시 북구', '대구광역시 동구', '대구광역시 동구', '안동시', '안동시'],
        'crop': ['사과', '사과', '사과', '포도', '사과', '포도'],
        'avg_temp': [14.5, 15.0, 14.8, 16.2, 13.5, 15.5],
        'precipitation': [1100.5, 1050.0, 1120.0, 980.5, 1200.0, 1000.0],
        'soil_moisture': [35.2, 34.1, 36.5, 30.0, 38.0, 32.5],
        'yield_per_hectare': [2500, 2450, 2550, 2100, 2700, 2150]
    }
    df = pd.DataFrame(data)
    print("--- Original Sample Data ---")
    print(df)
    
    # 2. Detect Metadata
    metadata = SingleTableMetadata()
    metadata.detect_from_dataframe(df)
    
    # 3. Initialize and train the open-source synthesizer
    synthesizer = GaussianCopulaSynthesizer(metadata)
    synthesizer.fit(df)
    
    # 4. Generate synthetic data
    print("\n⏳ Generating 100 synthetic rows to augment our Agricultural AI model...")
    synthetic_data = synthesizer.sample(num_rows=100)
    
    # 5. Save to CSV
    os.makedirs('docs/test_data', exist_ok=True)
    output_path = 'docs/test_data/synthetic_agriculture_yield.csv'
    synthetic_data.to_csv(output_path, index=False)
    
    print("\n--- Snippet of Generated Synthetic Data ---")
    print(synthetic_data.head())
    print(f"\n✅ Successfully generated and saved to {output_path}")

if __name__ == "__main__":
    generate_data()

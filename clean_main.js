const fs = require('fs');
let code = fs.readFileSync('backend/app/main.py', 'utf-8');

const replacement = `@app.on_event("startup")
def restore_engine_from_db():
    db = SessionLocal()
    try:
        entries = db.query(DataEntry).order_by(DataEntry.created_at.asc()).all()
        print(f"🔄 Restoring engine from DB: {len(entries)} entries found.")
        types = ["Gu", "Dong", "Street", "Store"]
        
        for e in entries:
            path_list = [p for p in e.location_path.split("/") if p]
            target_obj = engine.create_or_get_path(path_list, types)
            
            entry_dict = {
                "id": e.id,
                "timestamp": str(e.created_at.strftime("%Y-%m-%d %H:%M")),
                "insights": e.insights,
                "hash": e.hash_val,
                "drive_link": e.drive_link,
                "scope": "store_specific" if len(path_list) >= 4 else "regional_general",
                "trust_index": e.trust_index,
                "raw_text": e.raw_text,
                "effective_value": e.effective_value
            }
            if "data_entries" not in target_obj:
                target_obj["data_entries"] = []
            target_obj["data_entries"].append(entry_dict)
            if len(target_obj["data_entries"]) > 50:
                target_obj["data_entries"].pop(0)
            
            if e.effective_value:
                engine.add_value_bottom_up(path_list, e.effective_value)
                
        print("✅ Successfully restored engine state from DB!")
    except Exception as e:
        print(f"Error restoring data: {e}")
    finally:
        db.close()`;

// Find @app.on_event("startup") block until the next @app.websocket
const startIdx = code.indexOf('@app.on_event("startup")');
const endIdx = code.indexOf('@app.websocket("/ws/updates")');

if(startIdx !== -1 && endIdx !== -1) {
    const originalBlock = code.substring(startIdx, endIdx);
    code = code.replace(originalBlock, replacement + '\n\n# --- 🚀 API Endpoints ---\n\n');
    fs.writeFileSync('backend/app/main.py', code);
    console.log("Replaced startup event in backend/app/main.py");
} else {
    console.log("Could not find blocks");
}

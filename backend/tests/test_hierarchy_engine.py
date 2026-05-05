import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, Region, Farm, DataEntry
from app.core.engine import HierarchyEngine

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine_db = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_db)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine_db)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine_db)

@pytest.fixture(scope="function")
def hierarchy_engine():
    return HierarchyEngine()

def test_create_or_get_path(db_session, hierarchy_engine):
    path_list = ["대구광역시", "군위군", "효령면", "사과 재배단지", "청송농원"]
    types = ["City", "City", "District", "Village", "Farm"]
    
    # Act
    target_obj = hierarchy_engine.create_or_get_path(db_session, path_list, types)
    
    # Assert
    assert target_obj is not None
    assert target_obj["name"] == "청송농원"
    assert target_obj["type"] == "Farm"
    
    # Verify parent links
    farm = db_session.query(Farm).filter(Farm.name == "청송농원").first()
    assert farm is not None
    
    street = db_session.query(Region).filter(Region.name == "사과 재배단지").first()
    assert farm.region_id == street.id
    
    dong = db_session.query(Region).filter(Region.name == "효령면").first()
    assert street.parent_id == dong.id

def test_add_value_bottom_up(db_session, hierarchy_engine):
    path_list = ["대구광역시", "군위군", "효령면", "사과 재배단지", "청송농원"]
    types = ["City", "City", "District", "Village", "Farm"]
    hierarchy_engine.create_or_get_path(db_session, path_list, types)
    
    # Act
    value_to_add = 15000
    hierarchy_engine.add_value_bottom_up(db_session, path_list, value_to_add)
    db_session.commit()
    
    # Assert
    farm = db_session.query(Farm).filter(Farm.name == "청송농원").first()
    db_session.refresh(farm)
    assert farm.total_value == 15000
    assert farm.pulse_rate > 70  # Should increase pulse
    
    city = db_session.query(Region).filter(Region.name == "대구광역시").first()
    db_session.refresh(city)
    assert city.total_value == 15000
    assert city.pulse_rate > 70
    assert city.nodes > 0

def test_add_value_multiple_stores(db_session, hierarchy_engine):
    types = ["City", "City", "District", "Village", "Farm"]
    path1 = ["대구광역시", "북구", "산격동", "연암로", "지니스팜"]
    path2 = ["대구광역시", "북구", "산격동", "연암로", "에그리테크"]
    
    hierarchy_engine.create_or_get_path(db_session, path1, types)
    hierarchy_engine.create_or_get_path(db_session, path2, types)
    
    hierarchy_engine.add_value_bottom_up(db_session, path1, 10000)
    db_session.commit()
    hierarchy_engine.add_value_bottom_up(db_session, path2, 25000)
    db_session.commit()
    
    # Assert roll-up
    city = db_session.query(Region).filter(Region.name == "대구광역시").first()
    db_session.refresh(city)
    assert city.total_value == 35000
    assert city.nodes == 5  # Total interactions
    
    gu = db_session.query(Region).filter(Region.name == "북구").first()
    assert gu.total_value == 35000

def test_get_object_with_data_entries(db_session, hierarchy_engine):
    types = ["City", "City", "Farm"]
    path = ["부산광역시", "해운대구", "바다식당"]
    hierarchy_engine.create_or_get_path(db_session, path, types)
    
    gu = db_session.query(Region).filter(Region.name == "해운대구").first()
    farm = db_session.query(Farm).filter(Farm.name == "바다식당").first()
    
    # Add data entries
    entry1 = DataEntry(location_path="부산광역시/해운대구/에그리팜", store_id=farm.id, industry="스마트팜", effective_value=5000, hash_val="hash1")
    entry2 = DataEntry(location_path="부산광역시/해운대구/에그리팜", store_id=farm.id, industry="스마트팜", effective_value=3000, hash_val="hash2")
    db_session.add_all([entry1, entry2])
    db_session.commit()
    
    # Act
    obj_data = hierarchy_engine.get_object(db_session, path)
    
    # Assert
    assert len(obj_data["data_entries"]) == 2
    assert obj_data["data_entries"][0]["hash"] in ["hash1", "hash2"]

    # Test top-down roll up from region level
    gu_data = hierarchy_engine.get_object(db_session, ["부산광역시", "해운대구"])
    assert len(gu_data["data_entries"]) == 2

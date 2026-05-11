import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, User, Farm, DataEntry, Region

# Use an in-memory SQLite DB for this test to not mess with the real DB
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_on_delete_cascade_user_farm(db_session):
    # Create user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Create farm linked to user
    farm = Farm(name="Test Farm", owner_id=user.id)
    db_session.add(farm)
    db_session.commit()
    db_session.refresh(farm)

    # Create data entry linked to farm
    entry = DataEntry(location_path="A/B/C", farm_id=farm.id, hash_val="hash123")
    db_session.add(entry)
    db_session.commit()

    assert db_session.query(User).count() == 1
    assert db_session.query(Farm).count() == 1
    assert db_session.query(DataEntry).count() == 1

    # Delete User, should cascade and delete Farm and DataEntry
    db_session.delete(user)
    db_session.commit()

    assert db_session.query(User).count() == 0
    assert db_session.query(Farm).count() == 0
    assert db_session.query(DataEntry).count() == 0
    print("Success: ON DELETE CASCADE from User to Farm to DataEntry works.")


def test_on_delete_cascade_region_farm(db_session):
    # Create region
    region = Region(name="Test Region", level_type="City")
    db_session.add(region)
    db_session.commit()
    db_session.refresh(region)

    # Create farm linked to region
    farm = Farm(name="Test Farm", region_id=region.id)
    db_session.add(farm)
    db_session.commit()

    assert db_session.query(Region).count() == 1
    assert db_session.query(Farm).count() == 1

    # Delete Region, should cascade and delete Farm
    db_session.delete(region)
    db_session.commit()

    assert db_session.query(Region).count() == 0
    assert db_session.query(Farm).count() == 0
    print("Success: ON DELETE CASCADE from Region to Farm works.")

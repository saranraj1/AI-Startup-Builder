import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.main import app

client = TestClient(app)

def test_health():
    assert client.get('/health').json()['status'] == 'ok'

def test_create_project_rejects_short_idea():
    response = client.post('/api/v1/projects', json={'idea': 'too short'})
    assert response.status_code == 422

def test_create_project_returns_project_contract():
    response = client.post('/api/v1/projects', json={'idea': 'AI planning software for startup founders'})

    assert response.status_code == 202
    body = response.json()
    assert body['id']
    assert body['name'] == 'Ai Planning Software'
    assert body['status'] in {'queued', 'running', 'completed'}
    assert body['progress'] >= 0
    assert body['createdAt']

def test_get_missing_project_returns_404():
    response = client.get('/api/v1/projects/not-a-real-project')

    assert response.status_code == 404

def test_regenerate_project_resets_generation_state():
    created = client.post('/api/v1/projects', json={'idea': 'A secure team planning workspace'}).json()
    response = client.post(f"/api/v1/projects/{created['id']}/generate")

    assert response.status_code == 202
    assert response.json()['status'] == 'queued'

def test_regenerate_missing_project_returns_404():
    response = client.post('/api/v1/projects/missing/generate')

    assert response.status_code == 404

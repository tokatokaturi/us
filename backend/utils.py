from flask import request, jsonify
from functools import wraps
import json

# Assuming these imports exist in your application
# from your_app import app, db
# from your_models import Product
# from your_auth import admin_required

# Helper function to parse comma-separated strings safely
def parse_comma_list(value):
    """Convert comma-separated string to list, handling None and empty strings"""
    if not value:
        return []
    if isinstance(value, list):
        return value
    return [item.strip() for item in str(value).split(',') if item.strip()]

# Helper function to serialize comma-separated fields
def serialize_comma_list(value):
    """Convert list to comma-separated string"""
    if not value:
        return ""
    if isinstance(value, str):
        return value
    return ",".join(str(item) for item in value)

# Helper function to parse JSON fields
def parse_json_field(value, default=None):
    """Safely parse JSON fields"""
    if not value:
        return default or {}
    if isinstance(value, dict):
        return value
    try:
        return json.loads(value)
    except:
        return default or {}

# Helper function to serialize JSON fields
def serialize_json_field(value):
    """Convert dict to JSON string"""
    if not value:
        return "{}"
    if isinstance(value, str):
        return value
    return json.dumps(value)



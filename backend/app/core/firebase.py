import os
import json
import logging

import dotenv
import firebase_admin
from firebase_admin import credentials, firestore

dotenv.load_dotenv()

logger = logging.getLogger(__name__)

_db = None


# Test/local function (commented as requested).
# Keep this for local testing with JSON file, do not use in production.
# def get_firestore():
#     global _db

#     if _db:
#         return _db

#     base_dir = os.path.dirname(os.path.abspath(__file__))
#     firebase_cred_path = os.path.join(base_dir, "firebase_adminsdk.json")

#     if not os.path.exists(firebase_cred_path):
#         raise FileNotFoundError(
#             f"Firebase credential file not found at {firebase_cred_path}"
#         )

#     if not firebase_admin._apps:
#         cred = credentials.Certificate(firebase_cred_path)
#         firebase_admin.initialize_app(cred)
#         logger.info("Firebase initialized (test/local file)")

#     _db = firestore.client()
#     return _db


# ----------------------------------Firestore Production Initialization----------------------------------
# Production function for Vercel.
# Set env var: FIREBASE_ADMINSDK_JSON with the full Firebase service account JSON.
def get_firestore():
    global _db

    if _db:
        return _db

    firebase_adminsdk_json = os.getenv("FIREBASE_ADMINSDK_JSON")
    if not firebase_adminsdk_json:
        raise ValueError(
            "Missing FIREBASE_ADMINSDK_JSON environment variable for production."
        )

    try:
        firebase_credentials = json.loads(firebase_adminsdk_json)
    except json.JSONDecodeError as e:
        raise ValueError("FIREBASE_ADMINSDK_JSON is not valid JSON.") from e

    if not firebase_admin._apps:
        cred = credentials.Certificate(firebase_credentials)
        firebase_admin.initialize_app(cred)
        logger.info("Firebase initialized (production env)")

    _db = firestore.client()
    return _db

"""
Quick test to verify Supabase connection and environment variables
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
db_url = os.getenv("DATABASE_URL")

print("=" * 60)
print("Environment Variable Test")
print("=" * 60)
print(f"DATABASE_URL found: {db_url is not None}")
if db_url:
    # Parse the URL to show connection details (hide password)
    if "postgresql" in db_url:
        parts = db_url.replace("postgresql+asyncpg://", "").split("@")
        if len(parts) == 2:
            creds = parts[0].split(":")
            host_db = parts[1]
            print(f"Username: {creds[0]}")
            print(f"Password: {'*' * len(creds[1]) if len(creds) > 1 else 'NOT SET'}")
            print(f"Host/Database: {host_db}")
    print(f"\nFull URL: {db_url}")
else:
    print("DATABASE_URL is NOT set!")
    print("\nMake sure .env file exists and contains:")
    print("DATABASE_URL=postgresql+asyncpg://...")

print("\n" + "=" * 60)
print("Testing Supabase Connection...")
print("=" * 60)

try:
    import asyncio
    import asyncpg

    async def test_connection():
        # Parse connection string
        conn_str = db_url.replace("postgresql+asyncpg://", "")

        try:
            # Try to connect
            conn = await asyncpg.connect(
                host="db.zlotbgolmmuggqpmckyx.supabase.co",
                port=5432,
                user="postgres",
                password="goonhacks2025",
                database="postgres",
                timeout=10
            )

            # Test query
            version = await conn.fetchval('SELECT version()')
            print(f"✅ Connection successful!")
            print(f"PostgreSQL version: {version[:50]}...")

            await conn.close()
            return True

        except asyncpg.exceptions.InvalidPasswordError:
            print("❌ Connection failed: Invalid password")
            return False
        except asyncpg.exceptions.InvalidCatalogNameError:
            print("❌ Connection failed: Database does not exist")
            return False
        except Exception as e:
            print(f"❌ Connection failed: {type(e).__name__}")
            print(f"Error: {str(e)}")
            return False

    # Run the test
    result = asyncio.run(test_connection())

    if result:
        print("\n🎉 All checks passed! Supabase connection is working.")
    else:
        print("\n⚠️  Connection test failed. Check:")
        print("   1. Supabase project is not paused")
        print("   2. Password is correct")
        print("   3. Internet connection is working")
        print("   4. Visit: https://supabase.com/dashboard")

except ImportError as e:
    print(f"❌ Missing module: {e}")
    print("Run: pip install asyncpg python-dotenv")
except Exception as e:
    print(f"❌ Test failed: {e}")

print("=" * 60)

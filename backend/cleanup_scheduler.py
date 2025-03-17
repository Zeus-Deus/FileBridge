import os
from datetime import datetime, timedelta
from apscheduler.schedulers.blocking import BlockingScheduler
from backend import create_app, db
from backend.src.models import FileUpload

app = create_app()

def cleanup_old_files():
    with app.app_context():
        now = datetime.utcnow()
        threshold = now - timedelta(hours=2)
        expired_files = FileUpload.query.filter(
            FileUpload.download_time != None,
            FileUpload.download_time < threshold,
            FileUpload.download_confirmed == False
        ).all()
        for file_record in expired_files:
            file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads', file_record.unique_filename)
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                db.session.delete(file_record)
                db.session.commit()
                print(f"Deleted expired file: {file_record.unique_filename}")
            except Exception as e:
                print(f"Error during cleanup for {file_record.unique_filename}: {e}")

if __name__ == '__main__':
    scheduler = BlockingScheduler()
    # Run cleanup every 30 minutes
    scheduler.add_job(cleanup_old_files, 'interval', minutes=30)
    print("Starting cleanup scheduler...")
    scheduler.start()


import csv

from django.core.management.base import BaseCommand
from students.models import Department


class Command(BaseCommand):
    help = "Import departments from department.csv"

    def handle(self, *args, **kwargs):

        with open("department.csv", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            count = 0

            for row in reader:
                Department.objects.update_or_create(
                    dep_id=int(float(row["dept_id"])),
                    defaults={
                        "department": row["dept_name"],
                        "stream_id": int(float(row["stream_id"]))
                        if row["stream_id"]
                        else None,
                    },
                )

                count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {count} departments successfully."
            )
        )

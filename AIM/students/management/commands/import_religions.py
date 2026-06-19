
import csv

from django.core.management.base import BaseCommand
from students.models import Religion


class Command(BaseCommand):
    help = "Import religions from religion.csv"

    def handle(self, *args, **kwargs):

        with open("religion.csv", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            count = 0

            for row in reader:
                Religion.objects.update_or_create(
                    religion_id=int(float(row["religion_id"])),
                    defaults={
                        "religion_name": row["religion_name"],
                    },
                )

                count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported {count} religions."
            )
        )

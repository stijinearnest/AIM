import csv

from django.core.management.base import BaseCommand
from students.models import Quota


class Command(BaseCommand):
    help = "Import quotas from quota.csv"
    requires_system_checks = []

    def handle(self, *args, **kwargs):

        with open("quota.csv", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            count = 0

            for row in reader:
                Quota.objects.update_or_create(
                    quota_id=int(float(row["quota_id"])),
                    defaults={
                        "quota_name": row["quota_name"],
                    },
                )

                count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported {count} quotas."
            )
        )

import csv

from django.core.management.base import BaseCommand
from students.models import Caste, Religion, Category


class Command(BaseCommand):
    help = "Import castes from caste.csv"

    def handle(self, *args, **kwargs):

        with open("caste.csv", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            count = 0

            for row in reader:

                religion = Religion.objects.get(
                    religion_id=int(float(row["religion_id"]))
                )

                category = Category.objects.get(
                    cat_id=int(float(row["cat_id"]))
                )

                Caste.objects.update_or_create(
                    caste_id=int(float(row["caste_id"])),
                    defaults={
                        "caste_name": row["caste_name"],
                        "religion": religion,
                        "category": category,
                    },
                )

                count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported {count} castes."
            )
        )


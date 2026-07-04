
import csv

from django.core.management.base import BaseCommand
from students.models import Category


class Command(BaseCommand):
    help = "Import categories from category.csv"

    def handle(self, *args, **kwargs):

        with open("category.csv", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            count = 0

            for row in reader:
                Category.objects.update_or_create(
                    cat_id=int(float(row["cat_id"])),
                    defaults={
                        "cat_name": row["cat_name"],
                    },
                )

                count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported {count} categories."
            )
        )

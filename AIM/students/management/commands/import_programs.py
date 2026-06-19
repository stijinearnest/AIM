
import csv

from django.core.management.base import BaseCommand
from students.models import programme, Department


class Command(BaseCommand):
    help = "Import programmes from programme.csv"

    def handle(self, *args, **kwargs):

        with open("programme.csv", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            count = 0

            for row in reader:

                department = Department.objects.get(
                    dep_id=int(float(row["dept_id"]))
                )

                programme.objects.update_or_create(
                    pgm_id=int(float(row["pgm_id"])),
                    defaults={
                        "pgm_name": row["pgm_name"],
                        "department": department,
                        "no_of_sems": int(float(row["no_of_sems"])),
                        "grad_level": row["grad_level"],
                    },
                )

                count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported {count} programmes."
            )
        )


import csv
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from rank.models import Result
from students.models import Caste, Quota, Religion, Student, programme


class Command(BaseCommand):
    help = "Reload students_student from stud_master_filtered.csv."
    requires_system_checks = []

    required_csv_columns = {
        "stud_id",
        "admn_no",
        "roll_no",
        "uty_reg_no",
        "name",
        "year_of_admn",
        "dob",
        "sex",
        "caste_id",
        "religion_id",
        "email",
        "contact_no",
        "house_name",
        "street",
        "place",
        "dist",
        "state",
        "pincode",
        "pgm_id",
        "marks_sslc",
        "marks_twelth",
        "board_twelth",
        "quota",
        "photo",
        "differently_abled",
        "date_of_admission",
        "date_of_leaving",
    }

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            default=str(settings.BASE_DIR / "stud_master_filtered.csv"),
            help="Path to the student CSV file.",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=1000,
            help="Number of students to insert per bulk_create batch.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Validate and count rows without deleting or inserting data.",
        )
        parser.add_argument(
            "--confirm-delete",
            action="store_true",
            help="Required to delete and reload students_student.",
        )

    def parse_date(self, value, row_number, column):
        value = self.clean_string(value)
        if value is None:
            return None

        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(value, fmt).date()
            except ValueError:
                continue

        raise CommandError(
            f"Row {row_number}: invalid date in {column}: {value!r}."
        )

    def parse_int(self, value, row_number, column, required=False):
        value = self.clean_string(value)
        if value is None:
            if required:
                raise CommandError(f"Row {row_number}: {column} is required.")
            return None

        try:
            return int(float(value))
        except ValueError as exc:
            raise CommandError(
                f"Row {row_number}: invalid integer in {column}: {value!r}."
            ) from exc

    def parse_float(self, value, row_number, column):
        value = self.clean_string(value)
        if value is None:
            return None

        try:
            return float(value)
        except ValueError as exc:
            raise CommandError(
                f"Row {row_number}: invalid number in {column}: {value!r}."
            ) from exc

    def parse_bool(self, value):
        value = self.clean_string(value)
        if value is None:
            return False

        return value.lower() in {"1", "true", "yes", "y"}

    def clean_string(self, value):
        if value is None:
            return None

        value = value.strip()
        if value == "":
            return None

        return value

    def build_student(self, row, row_number):
        return Student(
            stud_id=self.parse_int(row["stud_id"], row_number, "stud_id", required=True),
            admn_no=self.clean_string(row["admn_no"]) or "",
            roll_no=self.clean_string(row["roll_no"]),
            uty_reg_no=self.clean_string(row["uty_reg_no"]),
            name=self.clean_string(row["name"]) or "",
            year_of_admn=self.parse_int(
                row["year_of_admn"], row_number, "year_of_admn", required=True
            ),
            dob=self.parse_date(row["dob"], row_number, "dob"),
            sex=self.clean_string(row["sex"]) or "",
            caste_id=self.parse_int(row["caste_id"], row_number, "caste_id"),
            religion_id=self.parse_int(row["religion_id"], row_number, "religion_id"),
            email=self.clean_string(row["email"]),
            contact_no=self.clean_string(row["contact_no"]),
            house_name=self.clean_string(row["house_name"]),
            street=self.clean_string(row["street"]),
            place=self.clean_string(row["place"]),
            dist=self.clean_string(row["dist"]),
            state=self.clean_string(row["state"]),
            pincode=self.clean_string(row["pincode"]),
            programme_id=self.parse_int(row["pgm_id"], row_number, "pgm_id"),
            quota_id=self.parse_int(row["quota"], row_number, "quota"),
            marks_sslc=self.parse_float(row["marks_sslc"], row_number, "marks_sslc"),
            marks_twelth=self.parse_float(
                row["marks_twelth"], row_number, "marks_twelth"
            ),
            board_twelth=self.clean_string(row["board_twelth"]),
            photo=self.clean_string(row["photo"]),
            differently_abled=self.parse_bool(row["differently_abled"]),
            date_of_admission=self.parse_date(
                row["date_of_admission"], row_number, "date_of_admission"
            ),
            date_of_leaving=self.parse_date(
                row["date_of_leaving"], row_number, "date_of_leaving"
            ),
            year_of_leaving=self.parse_int(
                row.get("year_of_leaving"), row_number, "year_of_leaving"
            ),
        )

    def load_students_from_csv(self, csv_path):
        students = []
        seen_student_ids = set()

        with csv_path.open(newline="", encoding="utf-8-sig") as csvfile:
            reader = csv.DictReader(csvfile)
            if reader.fieldnames is None:
                raise CommandError("CSV file is empty.")

            missing_columns = self.required_csv_columns - set(reader.fieldnames)
            if missing_columns:
                columns = ", ".join(sorted(missing_columns))
                raise CommandError(f"CSV is missing required column(s): {columns}.")

            for row_number, row in enumerate(reader, start=2):
                student = self.build_student(row, row_number)
                if student.stud_id in seen_student_ids:
                    raise CommandError(
                        f"Row {row_number}: duplicate stud_id {student.stud_id}."
                    )

                seen_student_ids.add(student.stud_id)
                students.append(student)

        return students, seen_student_ids

    def validate_foreign_keys(self, students):
        checks = (
            ("caste_id", Caste),
            ("religion_id", Religion),
            ("programme_id", programme),
            ("quota_id", Quota),
        )

        for field_name, model in checks:
            ids = {
                getattr(student, field_name)
                for student in students
                if getattr(student, field_name) is not None
            }
            if not ids:
                continue

            existing_ids = set(model.objects.filter(pk__in=ids).values_list("pk", flat=True))
            missing_ids = sorted(ids - existing_ids)
            if missing_ids:
                shown_ids = ", ".join(str(value) for value in missing_ids[:25])
                if len(missing_ids) > 25:
                    shown_ids += f", ... ({len(missing_ids)} total)"

                raise CommandError(
                    f"CSV contains {field_name} value(s) not found in "
                    f"{model._meta.db_table}: {shown_ids}."
                )

    def handle(self, *args, **options):
        csv_path = Path(options["csv"]).expanduser()
        batch_size = options["batch_size"]

        if not csv_path.exists():
            raise CommandError(f"CSV file does not exist: {csv_path}")

        students, student_ids = self.load_students_from_csv(csv_path)
        self.validate_foreign_keys(students)
        self.stdout.write(f"Validated {len(students)} student row(s) from {csv_path}.")

        if options["dry_run"]:
            self.stdout.write(self.style.SUCCESS("Dry run passed. No data changed."))
            return

        if not options["confirm_delete"]:
            raise CommandError(
                "This command deletes and reloads students_student. "
                "Re-run with --confirm-delete after checking --dry-run."
            )

        with transaction.atomic():
            result_rows = list(
                Result.objects.values(
                    "id",
                    "student_id",
                    "rank",
                    "status",
                    "ogpa",
                    "marks",
                    "result_year",
                )
            )
            missing_result_student_ids = sorted(
                {row["student_id"] for row in result_rows} - student_ids
            )
            if missing_result_student_ids:
                raise CommandError(
                    "Reload cancelled because result data exists for student IDs "
                    "not present in the CSV: "
                    + ", ".join(str(student_id) for student_id in missing_result_student_ids)
                )

            deleted_count, _ = Student.objects.all().delete()
            Student.objects.bulk_create(students, batch_size=batch_size)
            Result.objects.bulk_create(
                [Result(**row) for row in result_rows],
                batch_size=batch_size,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Reloaded {len(students)} student row(s) into students_student. "
                f"Deleted {deleted_count} dependent row(s) during reload and restored "
                f"{len(result_rows)} result row(s)."
            )
        )

# Generated manually for the rank app

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("students", "0006_program"),
    ]

    operations = [
        migrations.CreateModel(
            name="Rank",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("rank", models.PositiveIntegerField()),
                ("ogpa", models.DecimalField(decimal_places=2, max_digits=4)),
                (
                    "marks",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=6,
                        null=True,
                    ),
                ),
                ("result_year", models.PositiveIntegerField()),
                (
                    "student",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="ranks",
                        to="students.student",
                    ),
                ),
            ],
            options={
                "db_table": "rank",
                "unique_together": {("student", "result_year")},
            },
        ),
    ]

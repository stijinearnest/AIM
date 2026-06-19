# Generated manually after changing rank storage into course result storage

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("rank", "0002_current_rank_per_student"),
        ("students", "0006_program"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Rank",
            new_name="Result",
        ),
        migrations.AlterModelTable(
            name="result",
            table="result",
        ),
        migrations.AlterField(
            model_name="result",
            name="student",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="result",
                to="students.student",
            ),
        ),
        migrations.AlterField(
            model_name="result",
            name="rank",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="result",
            name="status",
            field=models.CharField(
                choices=[("P", "Pass"), ("F", "Fail")],
                default="P",
                max_length=1,
            ),
        ),
    ]

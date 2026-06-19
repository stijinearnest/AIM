# Generated manually after changing rank storage to current rank per student

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("rank", "0001_initial"),
        ("students", "0006_program"),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="rank",
            unique_together=set(),
        ),
        migrations.AlterField(
            model_name="rank",
            name="student",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="rank",
                to="students.student",
            ),
        ),
    ]

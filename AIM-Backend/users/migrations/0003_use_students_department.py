# Generated manually after switching user profiles to students.Department

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("students", "0006_program"),
        ("users", "0002_department_userprofile_department"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userprofile",
            name="department",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="students.department",
            ),
        ),
        migrations.DeleteModel(
            name="Department",
        ),
    ]

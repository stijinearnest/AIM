# Generated manually after restricting result ranks to 1, 2, 3, or null

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("result", "0003_rename_rank_to_result_add_status"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="result",
            constraint=models.CheckConstraint(
                condition=models.Q(rank__in=[1, 2, 3]) | models.Q(rank__isnull=True),
                name="result_rank_1_to_3_or_null",
            ),
        ),
    ]

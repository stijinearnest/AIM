# Generated migration for adding year_of_leaving to Student model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0006_program'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='year_of_leaving',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]

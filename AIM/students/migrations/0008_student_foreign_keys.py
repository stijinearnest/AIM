# Generated migration for adding Foreign Keys to Student model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0007_student_year_of_leaving'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='student',
            name='caste_id',
        ),
        migrations.RemoveField(
            model_name='student',
            name='religion_id',
        ),
        migrations.RemoveField(
            model_name='student',
            name='pgm_id',
        ),
        migrations.RemoveField(
            model_name='student',
            name='quota',
        ),
        migrations.AddField(
            model_name='student',
            name='caste',
            field=models.ForeignKey(blank=True, db_column='caste_id', null=True, on_delete=django.db.models.deletion.SET_NULL, to='students.caste'),
        ),
        migrations.AddField(
            model_name='student',
            name='religion',
            field=models.ForeignKey(blank=True, db_column='religion_id', null=True, on_delete=django.db.models.deletion.SET_NULL, to='students.religion'),
        ),
        migrations.AddField(
            model_name='student',
            name='programme',
            field=models.ForeignKey(blank=True, db_column='pgm_id', null=True, on_delete=django.db.models.deletion.SET_NULL, to='students.programme'),
        ),
        migrations.AddField(
            model_name='student',
            name='quota',
            field=models.ForeignKey(blank=True, db_column='quota_id', null=True, on_delete=django.db.models.deletion.SET_NULL, to='students.quota'),
        ),
    ]

from django.db import models

class Student(models.Model):
    stud_id = models.IntegerField(primary_key=True)
    admn_no = models.CharField(max_length=20)
    roll_no = models.CharField(max_length=20, blank=True, null=True)
    uty_reg_no = models.CharField(max_length=30, blank=True, null=True)

    name = models.CharField(max_length=255)
    year_of_admn = models.IntegerField()
    is_studying = models.BooleanField(default=True)
    dob = models.DateField(null=True, blank=True)
    sex = models.CharField(max_length=1)

    caste = models.ForeignKey(
        'Caste',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="caste_id",
    )
    religion = models.ForeignKey(
        'Religion',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="religion_id",
    )

    email = models.EmailField(blank=True, null=True)
    contact_no = models.CharField(max_length=15, blank=True, null=True)

    house_name = models.CharField(max_length=255, blank=True, null=True)
    street = models.CharField(max_length=255, blank=True, null=True)
    place = models.CharField(max_length=255, blank=True, null=True)
    dist = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    programme = models.ForeignKey(
        'programme',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="pgm_id",
    )
    quota = models.ForeignKey(
        'Quota',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="quota_id",
    )

    marks_sslc = models.FloatField(null=True, blank=True)
    marks_twelth = models.FloatField(null=True, blank=True)
    board_twelth = models.CharField(max_length=100, blank=True, null=True)

    photo = models.TextField(blank=True, null=True)

    differently_abled = models.BooleanField(default=False)

    date_of_admission = models.DateField(null=True, blank=True)
    date_of_leaving = models.DateField(null=True, blank=True)
    year_of_leaving = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name



class Department(models.Model):
    dep_id = models.IntegerField(primary_key=True)
    department = models.CharField(max_length=100)
    stream_id = models.IntegerField()

    def __str__(self):
        return self.department

class programme(models.Model):
    pgm_id = models.IntegerField(primary_key=True)
    pgm_name = models.CharField(max_length=150)

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        db_column="dept_id",
    )

    no_of_sems = models.IntegerField()
    grad_level = models.CharField(max_length=20)

    def __str__(self):
        return self.pgm_name


class Category(models.Model):
    cat_id = models.IntegerField(primary_key=True)
    cat_name = models.CharField(max_length=100)

    def __str__(self):
        return self.cat_name



class Religion(models.Model):
    religion_id = models.IntegerField(primary_key=True)
    religion_name = models.CharField(max_length=100)

    def __str__(self):
        return self.religion_name



class Caste(models.Model):
    caste_id = models.IntegerField(primary_key=True)
    caste_name = models.CharField(max_length=100)

    religion = models.ForeignKey(
        Religion,
        on_delete=models.CASCADE,
        db_column="religion_id",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        db_column="cat_id",
    )

    def __str__(self):
        return self.caste_name


class Quota(models.Model):
    quota_id = models.IntegerField(primary_key=True)
    quota_name = models.CharField(max_length=100)

    def __str__(self):
        return self.quota_name


from django.db import models
from students.models import Student


class Result(models.Model):
    STATUS_CHOICES = [
        ("P", "Pass"),
        ("F", "Fail"),
    ]

    student = models.OneToOneField(
        Student,
        on_delete=models.CASCADE,
        related_name="result",
    )

    rank = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default="P")
    ogpa = models.DecimalField(max_digits=4, decimal_places=2)
    marks = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )

    result_year = models.PositiveIntegerField()

    class Meta:
        db_table = "result"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(rank__in=[1, 2, 3]) | models.Q(rank__isnull=True),
                name="result_rank_1_to_3_or_null",
            ),
        ]

    def __str__(self):
        return f"{self.student} - Result {self.result_year} ({self.status})"

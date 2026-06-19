from rest_framework import serializers
from .models import Result


class RankListSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source="student.stud_id", read_only=True)
    student_name = serializers.CharField(source="student.name", read_only=True)
    year_of_admn = serializers.IntegerField(source="student.year_of_admn", read_only=True)
    programme_id = serializers.IntegerField(source="student.programme_id", read_only=True)
    programme_name = serializers.SerializerMethodField()
    department_id = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = Result
        fields = [
            "student_id",
            "student_name",
            "year_of_admn",
            "programme_id",
            "programme_name",
            "department_id",
            "department",
            "rank",
            "status",
            "ogpa",
            "marks",
            "result_year",
        ]

    def get_programme_name(self, obj):
        programme = self.context.get("programmes", {}).get(obj.student.programme_id)
        return programme.pgm_name if programme else None

    def get_department_id(self, obj):
        programme = self.context.get("programmes", {}).get(obj.student.programme_id)
        return programme.department_id if programme else None

    def get_department(self, obj):
        programme = self.context.get("programmes", {}).get(obj.student.programme_id)
        return programme.department.department if programme else None


class RankItemSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    rank = serializers.IntegerField(
        min_value=1,
        max_value=3,
        required=False,
        allow_null=True,
    )
    status = serializers.ChoiceField(choices=Result.STATUS_CHOICES, default="P")
    ogpa = serializers.DecimalField(max_digits=4, decimal_places=2)
    marks = serializers.DecimalField(
        max_digits=6,
        decimal_places=2,
        required=False,
        allow_null=True,
    )


class RankUpdateSerializer(serializers.Serializer):
    result_year = serializers.IntegerField(min_value=1)
    year_of_admn = serializers.IntegerField(min_value=1)
    programme_id = serializers.IntegerField(min_value=1, required=False)
    programme = serializers.CharField(required=False, allow_blank=False)
    department_id = serializers.IntegerField(min_value=1, required=False)
    department = serializers.CharField(required=False, allow_blank=False)
    results = RankItemSerializer(many=True, required=False)
    ranks = RankItemSerializer(many=True, required=False)

    def validate(self, attrs):
        has_programme = bool(attrs.get("programme_id") or attrs.get("programme"))
        has_department = bool(attrs.get("department_id") or attrs.get("department"))

        if not has_programme or not has_department:
            raise serializers.ValidationError(
                "Provide both programme/programme_id and department/department_id."
            )

        result_items = attrs.get("results") or attrs.get("ranks")
        if not result_items:
            raise serializers.ValidationError(
                {"results": "At least one result item is required."}
            )
        attrs["results"] = result_items

        return attrs

    def validate_ranks(self, value):
        return self.validate_results(value)

    def validate_results(self, value):
        if not value:
            raise serializers.ValidationError("At least one result item is required.")

        rank_values = [
            item["rank"] for item in value if item.get("rank") is not None
        ]
        if len(rank_values) != len(set(rank_values)):
            raise serializers.ValidationError("Duplicate rank values are not allowed.")
        if rank_values and sorted(rank_values) != list(range(1, len(rank_values) + 1)):
            raise serializers.ValidationError("Ranks must start at 1 without gaps.")
        if len(rank_values) > 3:
            raise serializers.ValidationError("Only ranks 1, 2, and 3 are allowed.")

        student_ids = [item["student_id"] for item in value]
        if len(student_ids) != len(set(student_ids)):
            raise serializers.ValidationError("Duplicate students are not allowed.")

        return value

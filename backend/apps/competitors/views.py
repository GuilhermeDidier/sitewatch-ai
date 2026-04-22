from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Competitor
from .serializers import CompetitorSerializer


class CompetitorListCreateView(generics.ListCreateAPIView):
    serializer_class = CompetitorSerializer

    def get_queryset(self):
        return Competitor.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CompetitorDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CompetitorSerializer

    def get_queryset(self):
        return Competitor.objects.filter(user=self.request.user)


class ScrapeCompetitorView(APIView):
    """Trigger an on-demand scrape for a competitor."""

    def post(self, request, pk):
        try:
            competitor = Competitor.objects.get(pk=pk, user=request.user)
        except Competitor.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        from apps.scraping.tasks import scrape_competitor

        try:
            result = scrape_competitor.delay(competitor.id)
            # With CELERY_TASK_ALWAYS_EAGER, check if the task failed
            if hasattr(result, 'result') and isinstance(result.result, Exception):
                raise result.result
            return Response(
                {"message": f"Scraping completed for {competitor.name}"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"error": f"Scraping failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

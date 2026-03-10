from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('employment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='interview',
            name='candidate_timezone',
            field=models.CharField(blank=True, default='UTC', max_length=50),
        ),
        migrations.AddField(
            model_name='evaluation',
            name='score_weights',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]

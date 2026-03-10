"""
AtonixDev Employment Console
Data Models — Founder Directive §4.0

Hierarchy:
  JobPosting             — §4.1  Job Listings Module
  Application            — §4.2  Application Intake Module
  ApplicationDocument    — §4.2  Document uploads (CV, portfolio, certificates)
  Interview              — §4.4  Interview Management Module
  Evaluation             — §4.5  Evaluation & Decision Module
  Employee               — §4.6  Employee Directory Module
  EmploymentNotification — §4.7  Notifications & Communication Module
  EmploymentAuditLog     — §3.3/§3.4  Transparency & Compliance
"""

import uuid

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# ─────────────────────────────────────────────────────────────────────────────
# §4.1 — Job Posting
# ─────────────────────────────────────────────────────────────────────────────

class JobPosting(models.Model):
    DEPARTMENT_CHOICES = [
        ('engineering',    'Engineering'),
        ('design',         'Design'),
        ('product',        'Product'),
        ('operations',     'Operations'),
        ('support',        'Customer Support'),
        ('community',      'Community'),
        ('marketing',      'Marketing'),
        ('legal',          'Legal'),
        ('finance',        'Finance'),
        ('partnerships',   'Partnerships'),
        ('research',       'Research & Development'),
        ('infrastructure', 'Infrastructure'),
    ]
    TYPE_CHOICES = [
        ('full_time',   'Full-time'),
        ('part_time',   'Part-time'),
        ('contract',    'Contract'),
        ('internship',  'Internship'),
        ('volunteer',   'Volunteer'),
    ]
    STATUS_CHOICES = [
        ('draft',  'Draft'),
        ('open',   'Open'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
    ]
    EXPERIENCE_CHOICES = [
        ('entry',     'Entry Level'),
        ('mid',       'Mid Level'),
        ('senior',    'Senior'),
        ('lead',      'Lead / Principal'),
        ('executive', 'Executive'),
    ]

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title            = models.CharField(max_length=255, db_index=True)
    department       = models.CharField(max_length=30, choices=DEPARTMENT_CHOICES, db_index=True)
    job_type         = models.CharField(max_length=20, choices=TYPE_CHOICES, default='full_time')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='mid')
    location         = models.CharField(max_length=255, blank=True)
    is_remote        = models.BooleanField(default=True)
    description      = models.TextField()
    requirements     = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True)
    salary_min       = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max       = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency  = models.CharField(max_length=3, default='USD')
    # Structured screening questions: [{"question": "...", "required": true}]
    screening_questions = models.JSONField(default=list, blank=True)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', db_index=True)
    created_by       = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_job_postings',
    )
    opens_at         = models.DateTimeField(null=True, blank=True)
    closes_at        = models.DateTimeField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Job Posting'
        verbose_name_plural = 'Job Postings'

    @property
    def applications_count(self):
        return self.applications.count()

    def __str__(self):
        return f'{self.title} [{self.department}] — {self.status.upper()}'


# ─────────────────────────────────────────────────────────────────────────────
# §4.2 — Application
# ─────────────────────────────────────────────────────────────────────────────

class Application(models.Model):
    STATUS_CHOICES = [
        ('submitted',   'Submitted'),
        ('screening',   'Screening'),
        ('shortlisted', 'Shortlisted'),
        ('interview',   'Interview'),
        ('evaluation',  'Evaluation'),
        ('offer',       'Offer Extended'),
        ('hired',       'Hired'),
        ('rejected',    'Rejected'),
        ('withdrawn',   'Withdrawn'),
    ]

    id                 = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job                = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    # Candidate information
    first_name         = models.CharField(max_length=100)
    last_name          = models.CharField(max_length=100)
    email              = models.EmailField(db_index=True)
    phone              = models.CharField(max_length=30, blank=True)
    location           = models.CharField(max_length=255, blank=True)
    linkedin_url       = models.URLField(blank=True)
    portfolio_url      = models.URLField(blank=True)
    github_url         = models.URLField(blank=True)
    cover_letter       = models.TextField(blank=True)
    # Answers to screening questions: {"question": "answer"}
    screening_answers  = models.JSONField(default=dict, blank=True)
    # Process management
    status             = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted', db_index=True)
    assigned_to        = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_applications',
    )
    notes              = models.TextField(blank=True)
    internal_rating    = models.PositiveSmallIntegerField(null=True, blank=True)  # 1–5
    # Linked system user (if candidate has an account)
    user               = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='job_applications',
    )
    submitted_at       = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        ordering          = ['-submitted_at']
        verbose_name      = 'Application'
        verbose_name_plural = 'Applications'
        unique_together   = [('job', 'email')]

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def __str__(self):
        return f'{self.full_name} → {self.job.title} [{self.status.upper()}]'


# ─────────────────────────────────────────────────────────────────────────────
# §4.2 — Application Documents
# ─────────────────────────────────────────────────────────────────────────────

class ApplicationDocument(models.Model):
    DOC_TYPE_CHOICES = [
        ('cv',          'CV / Resume'),
        ('portfolio',   'Portfolio'),
        ('cover',       'Cover Letter'),
        ('certificate', 'Certificate'),
        ('other',       'Other'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application   = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='documents')
    doc_type      = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES, default='cv')
    file          = models.FileField(upload_to='employment/documents/%Y/%m/')
    original_name = models.CharField(max_length=255)
    file_size     = models.PositiveIntegerField(default=0)  # bytes
    uploaded_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Application Document'
        verbose_name_plural = 'Application Documents'

    def __str__(self):
        return f'{self.doc_type.upper()} — {self.original_name}'


# ─────────────────────────────────────────────────────────────────────────────
# §4.4 — Interview
# ─────────────────────────────────────────────────────────────────────────────

class Interview(models.Model):
    FORMAT_CHOICES = [
        ('video',      'Video Call'),
        ('phone',      'Phone Call'),
        ('chat',       'Text Chat'),
        ('coding',     'Coding Test'),
        ('in_person',  'In Person'),
        ('document',   'Document Review'),
    ]
    STATUS_CHOICES = [
        ('scheduled',   'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed',   'Completed'),
        ('cancelled',   'Cancelled'),
        ('no_show',     'No Show'),
        ('rescheduled', 'Rescheduled'),
    ]
    ROUND_CHOICES = [
        (1, 'Round 1 — Screening'),
        (2, 'Round 2 — Technical'),
        (3, 'Round 3 — Values / Culture'),
        (4, 'Round 4 — Final / Executive'),
        (5, 'Round 5 — Offer Discussion'),
    ]

    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application      = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    interviewer      = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='conducted_interviews',
    )
    round            = models.PositiveSmallIntegerField(choices=ROUND_CHOICES, default=1)
    format           = models.CharField(max_length=20, choices=FORMAT_CHOICES, default='video')
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled', db_index=True)
    scheduled_at       = models.DateTimeField(null=True, blank=True)
    duration_minutes   = models.PositiveSmallIntegerField(default=60)
    meeting_link       = models.URLField(blank=True)
    # §3.5 — Timezone-aware scheduling
    candidate_timezone = models.CharField(max_length=50, default='UTC', blank=True)
    notes              = models.TextField(blank=True)
    completed_at       = models.DateTimeField(null=True, blank=True)
    created_at         = models.DateTimeField(auto_now_add=True)
    updated_at         = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']
        verbose_name = 'Interview'
        verbose_name_plural = 'Interviews'

    def __str__(self):
        return (
            f'Round {self.round} [{self.format.upper()}] — '
            f'{self.application.full_name} — {self.status.upper()}'
        )


# ─────────────────────────────────────────────────────────────────────────────
# §4.5 — Evaluation
# ─────────────────────────────────────────────────────────────────────────────

class Evaluation(models.Model):
    RECOMMENDATION_CHOICES = [
        ('strong_hire',    'Strong Hire'),
        ('hire',           'Hire'),
        ('hold',           'Hold for Later'),
        ('no_hire',        'No Hire'),
        ('strong_no_hire', 'Strong No Hire'),
    ]
    DECISION_CHOICES = [
        ('pending',  'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id                    = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview             = models.OneToOneField(
        Interview, on_delete=models.CASCADE, related_name='evaluation', null=True, blank=True,
    )
    application           = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='evaluations')
    evaluator             = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='submitted_evaluations',
    )
    # Scoring 1–10
    technical_score       = models.PositiveSmallIntegerField(null=True, blank=True)
    communication_score   = models.PositiveSmallIntegerField(null=True, blank=True)
    culture_score         = models.PositiveSmallIntegerField(null=True, blank=True)
    problem_solving_score = models.PositiveSmallIntegerField(null=True, blank=True)
    experience_score      = models.PositiveSmallIntegerField(null=True, blank=True)
    # §3.6 — Weighted scoring: {"technical": 2.0, "communication": 1.0, ...}
    score_weights         = models.JSONField(default=dict, blank=True)
    # Narrative
    strengths             = models.TextField(blank=True)
    weaknesses            = models.TextField(blank=True)
    notes                 = models.TextField(blank=True)
    recommendation        = models.CharField(max_length=20, choices=RECOMMENDATION_CHOICES)
    # Admin final decision
    admin_decision        = models.CharField(
        max_length=20, choices=DECISION_CHOICES, default='pending',
    )
    admin_notes           = models.TextField(blank=True)
    admin_decided_by      = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='admin_decisions',
    )
    admin_decided_at      = models.DateTimeField(null=True, blank=True)
    created_at            = models.DateTimeField(auto_now_add=True)
    updated_at            = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Evaluation'
        verbose_name_plural = 'Evaluations'

    DEFAULT_WEIGHTS = {
        'technical': 1.0, 'communication': 1.0, 'culture': 1.0,
        'problem_solving': 1.0, 'experience': 1.0,
    }

    @property
    def weighted_score(self):
        """Weight-aware average using score_weights; alias for overall_score."""
        return self.overall_score

    @property
    def overall_score(self):
        """Weighted average across all five scoring dimensions."""
        w = {**self.DEFAULT_WEIGHTS, **(self.score_weights or {})}
        pairs = [
            (self.technical_score,       w.get('technical', 1.0)),
            (self.communication_score,   w.get('communication', 1.0)),
            (self.culture_score,         w.get('culture', 1.0)),
            (self.problem_solving_score, w.get('problem_solving', 1.0)),
            (self.experience_score,      w.get('experience', 1.0)),
        ]
        valid = [(s, wt) for s, wt in pairs if s is not None]
        if not valid:
            return None
        total = sum(s * wt for s, wt in valid)
        wt_sum = sum(wt for _, wt in valid)
        return round(total / wt_sum, 1)

    def __str__(self):
        return (
            f'Eval: {self.application.full_name} — '
            f'{self.recommendation.upper()} — {self.admin_decision.upper()}'
        )


# ─────────────────────────────────────────────────────────────────────────────
# §4.6 — Employee Directory
# ─────────────────────────────────────────────────────────────────────────────

class Employee(models.Model):
    ROLE_CHOICES = [
        ('engineer',          'Engineer'),
        ('designer',          'Designer'),
        ('product_manager',   'Product Manager'),
        ('operations',        'Operations'),
        ('support',           'Support'),
        ('community_manager', 'Community Manager'),
        ('marketing',         'Marketing'),
        ('legal',             'Legal'),
        ('finance',           'Finance'),
        ('hr',                'Human Resources'),
        ('executive',         'Executive'),
        ('contractor',        'Contractor'),
        ('intern',            'Intern'),
        ('partner',           'Partner'),
    ]
    STATUS_CHOICES = [
        ('active',      'Active'),
        ('probation',   'Probation'),
        ('on_leave',    'On Leave'),
        ('suspended',   'Suspended'),
        ('terminated',  'Terminated'),
    ]

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='employee_profile',
    )
    application = models.OneToOneField(
        Application, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='hired_employee',
    )
    employee_id  = models.CharField(max_length=20, unique=True)
    first_name   = models.CharField(max_length=100)
    last_name    = models.CharField(max_length=100)
    email        = models.EmailField(unique=True)
    phone        = models.CharField(max_length=30, blank=True)
    department   = models.CharField(max_length=50)
    role         = models.CharField(max_length=30, choices=ROLE_CHOICES)
    title        = models.CharField(max_length=255, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='probation', db_index=True)
    location     = models.CharField(max_length=255, blank=True)
    is_remote    = models.BooleanField(default=True)
    start_date   = models.DateField()
    end_date     = models.DateField(null=True, blank=True)
    permissions  = models.JSONField(default=list, blank=True)
    metadata     = models.JSONField(default=dict, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def save(self, *args, **kwargs):
        if not self.employee_id:
            count = Employee.objects.count() + 1
            self.employee_id = f'EMP-{count:04d}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.employee_id} — {self.full_name} [{self.title or self.role}]'


# ─────────────────────────────────────────────────────────────────────────────
# §4.7 — Employment Notification
# ─────────────────────────────────────────────────────────────────────────────

class EmploymentNotification(models.Model):
    TYPE_CHOICES = [
        ('application_received', 'Application Received'),
        ('application_rejected', 'Application Rejected'),
        ('interview_invite',     'Interview Invitation'),
        ('interview_reminder',   'Interview Reminder'),
        ('offer_letter',         'Offer Letter'),
        ('onboarding',           'Onboarding Instructions'),
        ('custom',               'Custom Message'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent',    'Sent'),
        ('failed',  'Failed'),
    ]

    id                = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application       = models.ForeignKey(
        Application, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='notifications',
    )
    recipient_email   = models.EmailField()
    recipient_name    = models.CharField(max_length=255)
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    subject           = models.CharField(max_length=255)
    body              = models.TextField()
    status            = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    sent_at           = models.DateTimeField(null=True, blank=True)
    sent_by           = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='sent_notifications',
    )
    error_message     = models.TextField(blank=True)
    metadata          = models.JSONField(default=dict, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Employment Notification'
        verbose_name_plural = 'Employment Notifications'

    def __str__(self):
        return f'{self.notification_type.upper()} → {self.recipient_email} [{self.status.upper()}]'


# ─────────────────────────────────────────────────────────────────────────────
# §3.3/§3.4 — Audit Log
# ─────────────────────────────────────────────────────────────────────────────

class EmploymentAuditLog(models.Model):
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor         = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action        = models.CharField(max_length=100)        # e.g. 'application.status_changed'
    resource_type = models.CharField(max_length=50)         # e.g. 'application', 'interview'
    resource_id   = models.CharField(max_length=50)
    details       = models.JSONField(default=dict)
    ip_address    = models.GenericIPAddressField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Employment Audit Log'
        verbose_name_plural = 'Employment Audit Logs'

    def __str__(self):
        actor_str = self.actor.username if self.actor else 'system'
        return f'[{self.created_at:%Y-%m-%d %H:%M}] {actor_str} — {self.action}'

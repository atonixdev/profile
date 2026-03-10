"""
Employment Console — Role-Based Access Control (RBAC)
Founder Directive §5.3 / Architecture §2.4

Roles:
  admin      — Full access, approve hires, manage all
  hr         — View all applicants, schedule interviews, manage postings
  interviewer — View assigned applicants, conduct interviews, submit evals
  employee   — View own profile, update personal info
  candidate  — Apply, upload docs, join interviews (public / unauth)
"""

from rest_framework.permissions import BasePermission, IsAuthenticated

ROLE_ADMIN      = 'admin'
ROLE_HR         = 'hr'
ROLE_INTERVIEWER = 'interviewer'
ROLE_EMPLOYEE   = 'employee'


def get_employment_role(user):
    """
    Return the employment role for a user.
    Uses Django superuser/staff flags as fallback.
    """
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser:
        return ROLE_ADMIN
    if hasattr(user, 'employee_profile'):
        emp = user.employee_profile
        if emp.role == 'hr':
            return ROLE_HR
        return ROLE_EMPLOYEE
    if user.is_staff:
        return ROLE_ADMIN
    return None


class IsEmploymentAdmin(BasePermission):
    """Full access — superusers and staff."""
    message = 'Employment Console: Admin access required.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.is_superuser)
        )


class IsSuperuserOnly(BasePermission):
    """Superuser-only access (GDPR/compliance operations)."""
    message = 'Superuser access required for this operation.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_superuser
        )


class IsHROrAdmin(BasePermission):
    """HR or Admin access."""
    message = 'Employment Console: HR or Admin access required.'

    def has_permission(self, request, view):
        role = get_employment_role(request.user)
        return role in (ROLE_ADMIN, ROLE_HR)


class IsInterviewerOrAbove(BasePermission):
    """Interviewer, HR, or Admin."""
    message = 'Employment Console: Interviewer access required.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = get_employment_role(request.user)
        if role in (ROLE_ADMIN, ROLE_HR):
            return True
        # Check if user is an assigned interviewer
        from .models import Interview
        return Interview.objects.filter(
            interviewer=request.user,
        ).exists()


class IsAuthenticatedEmployee(BasePermission):
    """Any authenticated staff or employee."""
    message = 'Employment Console: Authentication required.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

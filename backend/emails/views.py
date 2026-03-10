from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from rest_framework import status


class EmailLogPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ── Email Log ─────────────────────────────────────────────────────────────────

class EmailLogListView(APIView):
    """Read-only paginated list of EmailLog records. Staff only."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from emails.models import EmailLog
        qs = EmailLog.objects.order_by('-created_at')

        email_type = request.query_params.get('email_type', '').strip()
        if email_type:
            qs = qs.filter(email_type=email_type)

        status_filter = request.query_params.get('status', '').strip()
        if status_filter:
            qs = qs.filter(status=status_filter)

        recipient = request.query_params.get('recipient', '').strip()
        if recipient:
            qs = qs.filter(recipient__icontains=recipient)

        paginator = EmailLogPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                'id': str(obj.pk),
                'recipient': obj.recipient,
                'subject': obj.subject,
                'email_type': obj.email_type,
                'template_name': obj.template_name,
                'status': obj.status,
                'error_message': obj.error_message,
                'ip_address': obj.ip_address,
                'created_at': obj.created_at.isoformat() if obj.created_at else None,
            }
            for obj in page
        ]
        return paginator.get_paginated_response(data)


class SecurityAuditLogListView(APIView):
    """Read-only paginated list of SecurityAuditLog records. Staff only."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from emails.models import SecurityAuditLog
        qs = SecurityAuditLog.objects.select_related('actor', 'target_user').order_by('-created_at')

        action = request.query_params.get('action', '').strip()
        if action:
            qs = qs.filter(action=action)

        paginator = EmailLogPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                'id': str(obj.pk),
                'action': obj.action,
                'actor': obj.actor.get_full_name() or obj.actor.username if obj.actor else None,
                'actor_email': obj.actor.email if obj.actor else None,
                'target_email': obj.target_email,
                'ip_address': obj.ip_address,
                'description': obj.description,
                'created_at': obj.created_at.isoformat() if obj.created_at else None,
            }
            for obj in page
        ]
        return paginator.get_paginated_response(data)


# ── Email Templates ───────────────────────────────────────────────────────────

class EmailTemplateListView(APIView):
    """List all templates (filtered by permission) or create a new one."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from emails.models import EmailTemplate
        if request.user.is_staff:
            qs = EmailTemplate.objects.filter(is_active=True)
        else:
            qs = EmailTemplate.objects.filter(is_active=True).exclude(
                permission='personal'
            ).exclude(permission='personal') | EmailTemplate.objects.filter(
                is_active=True, permission='personal', created_by=request.user
            )
            qs = (
                EmailTemplate.objects.filter(is_active=True, permission__in=['global', 'marketing']) |
                EmailTemplate.objects.filter(is_active=True, permission='personal', created_by=request.user)
            )

        category = request.query_params.get('category', '').strip()
        if category:
            qs = qs.filter(category=category)

        data = [
            {
                'template_id':  t.template_id,
                'name':         t.name,
                'category':     t.category,
                'permission':   t.permission,
                'subject':      t.subject,
                'preview_text': t.preview_text,
                'variables':    t.variables,
                'version':      t.version,
                'is_active':    t.is_active,
                'created_by':   t.created_by.email if t.created_by else None,
                'updated_at':   t.updated_at.isoformat() if t.updated_at else None,
            }
            for t in qs.order_by('category', 'name')
        ]
        return Response(data)

    def post(self, request):
        from emails.models import EmailTemplate
        d = request.data

        # Only staff can create global/marketing templates
        permission = d.get('permission', 'personal')
        if permission in ('global', 'marketing') and not request.user.is_staff:
            return Response({'error': 'Only staff can create global or marketing templates.'}, status=403)

        template_id = d.get('template_id', '').strip()
        if not template_id:
            return Response({'error': 'template_id is required.'}, status=400)
        if EmailTemplate.objects.filter(template_id=template_id).exists():
            return Response({'error': f'template_id "{template_id}" already exists.'}, status=400)

        tmpl = EmailTemplate.objects.create(
            template_id=template_id,
            name=d.get('name', ''),
            category=d.get('category', 'custom'),
            permission=permission,
            subject=d.get('subject', ''),
            html_body=d.get('html_body', ''),
            text_body=d.get('text_body', ''),
            variables=d.get('variables', []),
            preview_text=d.get('preview_text', ''),
            created_by=request.user,
            last_edited_by=request.user,
        )
        return Response({'template_id': tmpl.template_id, 'name': tmpl.name}, status=201)


class EmailTemplateDetailView(APIView):
    """Retrieve, update or deactivate a single template."""
    permission_classes = [IsAuthenticated]

    def _get_template(self, template_id, user):
        from emails.models import EmailTemplate
        try:
            tmpl = EmailTemplate.objects.get(template_id=template_id)
        except EmailTemplate.DoesNotExist:
            return None, Response({'error': 'Not found.'}, status=404)
        # Personal templates only accessible by creator or staff
        if tmpl.permission == 'personal' and tmpl.created_by != user and not user.is_staff:
            return None, Response({'error': 'Not found.'}, status=404)
        return tmpl, None

    def get(self, request, template_id):
        tmpl, err = self._get_template(template_id, request.user)
        if err:
            return err
        return Response({
            'template_id':  tmpl.template_id,
            'name':         tmpl.name,
            'category':     tmpl.category,
            'permission':   tmpl.permission,
            'subject':      tmpl.subject,
            'html_body':    tmpl.html_body,
            'text_body':    tmpl.text_body,
            'preview_text': tmpl.preview_text,
            'variables':    tmpl.variables,
            'version':      tmpl.version,
            'is_active':    tmpl.is_active,
            'created_by':   tmpl.created_by.email if tmpl.created_by else None,
            'updated_at':   tmpl.updated_at.isoformat() if tmpl.updated_at else None,
        })

    def patch(self, request, template_id):
        tmpl, err = self._get_template(template_id, request.user)
        if err:
            return err
        if tmpl.permission == 'global' and not request.user.is_staff:
            return Response({'error': 'Only staff can edit global templates.'}, status=403)

        d = request.data
        for field in ('name', 'category', 'subject', 'html_body', 'text_body', 'preview_text', 'variables', 'is_active'):
            if field in d:
                setattr(tmpl, field, d[field])
        tmpl.version += 1
        tmpl.last_edited_by = request.user
        tmpl.save()
        return Response({'template_id': tmpl.template_id, 'version': tmpl.version})

    def delete(self, request, template_id):
        if not request.user.is_staff:
            return Response({'error': 'Only staff can delete templates.'}, status=403)
        tmpl, err = self._get_template(template_id, request.user)
        if err:
            return err
        tmpl.is_active = False
        tmpl.save(update_fields=['is_active'])
        return Response({'deleted': True})


class EmailTemplatePreviewView(APIView):
    """Render a template with sample variables and return rendered HTML."""
    permission_classes = [IsAuthenticated]

    def post(self, request, template_id):
        from emails.models import EmailTemplate
        try:
            tmpl = EmailTemplate.objects.get(template_id=template_id, is_active=True)
        except EmailTemplate.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        variables = request.data.get('variables', {})
        try:
            rendered_html = tmpl.html_body.replace('{{', '{').replace('}}', '}').format_map(
                {k: variables.get(k, f'[{k}]') for k in tmpl.variables}
            )
            rendered_subject = tmpl.subject.replace('{{', '{').replace('}}', '}').format_map(
                {k: variables.get(k, f'[{k}]') for k in tmpl.variables}
            )
        except Exception as exc:
            return Response({'error': str(exc)}, status=400)

        return Response({'subject': rendered_subject, 'html': rendered_html})


# ── Sender Identities ─────────────────────────────────────────────────────────

class SenderIdentityListView(APIView):
    """Manage verified sender identities. Staff only."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from emails.models import SenderIdentity
        qs = SenderIdentity.objects.all().order_by('domain', 'email')
        data = [
            {
                'id':             s.pk,
                'email':          s.email,
                'display_name':   s.display_name,
                'domain':         s.domain,
                'usage':          s.usage,
                'is_verified':    s.is_verified,
                'reply_to':       s.reply_to,
                'spf_verified':   s.spf_verified,
                'dkim_verified':  s.dkim_verified,
                'dmarc_verified': s.dmarc_verified,
                'dns_status':     s.dns_status,
                'notes':          s.notes,
            }
            for s in qs
        ]
        return Response(data)

    def post(self, request):
        from emails.models import SenderIdentity
        d = request.data
        email = d.get('email', '').strip()
        if not email:
            return Response({'error': 'email is required.'}, status=400)
        if SenderIdentity.objects.filter(email=email).exists():
            return Response({'error': 'Sender identity already exists.'}, status=400)

        si = SenderIdentity.objects.create(
            email=email,
            display_name=d.get('display_name', ''),
            domain=d.get('domain', email.split('@')[-1]),
            usage=d.get('usage', 'transactional'),
            reply_to=d.get('reply_to', ''),
            notes=d.get('notes', ''),
        )
        return Response({'id': si.pk, 'email': si.email}, status=201)


class SenderIdentityDetailView(APIView):
    """Update a sender identity (e.g. mark DNS records verified)."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk):
        from emails.models import SenderIdentity
        try:
            si = SenderIdentity.objects.get(pk=pk)
        except SenderIdentity.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        d = request.data
        for field in ('display_name', 'usage', 'reply_to', 'is_verified',
                      'spf_verified', 'dkim_verified', 'dmarc_verified', 'notes'):
            if field in d:
                setattr(si, field, d[field])
        si.save()
        return Response({'id': si.pk, 'email': si.email, 'dns_status': si.dns_status})

    def delete(self, request, pk):
        from emails.models import SenderIdentity
        try:
            si = SenderIdentity.objects.get(pk=pk)
        except SenderIdentity.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        si.delete()
        return Response({'deleted': True})


# ── Campaigns ────────────────────────────────────────────────────────────────

class CampaignListView(APIView):
    """List campaigns or create a new one. Staff only."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        from emails.models import Campaign
        qs = Campaign.objects.select_related('template', 'sender_identity', 'created_by').order_by('-created_at')

        status_filter = request.query_params.get('status', '').strip()
        if status_filter:
            qs = qs.filter(status=status_filter)

        paginator = EmailLogPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                'id':               c.pk,
                'name':             c.name,
                'template_id':      c.template.template_id if c.template else None,
                'template_name':    c.template.name if c.template else None,
                'sender_email':     c.sender_identity.email if c.sender_identity else None,
                'sender_name':      c.sender_identity.display_name if c.sender_identity else None,
                'subject':          c.subject,
                'status':           c.status,
                'recipient_count':  c.recipient_count,
                'delivered_count':  c.delivered_count,
                'open_count':       c.open_count,
                'click_count':      c.click_count,
                'bounce_count':     c.bounce_count,
                'delivery_rate':    c.delivery_rate,
                'open_rate':        c.open_rate,
                'click_rate':       c.click_rate,
                'bounce_rate':      c.bounce_rate,
                'scheduled_at':     c.scheduled_at.isoformat() if c.scheduled_at else None,
                'sent_at':          c.sent_at.isoformat() if c.sent_at else None,
                'created_by':       c.created_by.email if c.created_by else None,
                'created_at':       c.created_at.isoformat() if c.created_at else None,
            }
            for c in page
        ]
        return paginator.get_paginated_response(data)

    def post(self, request):
        from emails.models import Campaign, EmailTemplate, SenderIdentity
        d = request.data

        template = None
        if d.get('template_id'):
            try:
                template = EmailTemplate.objects.get(template_id=d['template_id'], is_active=True)
            except EmailTemplate.DoesNotExist:
                return Response({'error': f'Template "{d["template_id"]}" not found.'}, status=400)

        sender = None
        if d.get('sender_identity_id'):
            try:
                sender = SenderIdentity.objects.get(pk=d['sender_identity_id'])
            except SenderIdentity.DoesNotExist:
                return Response({'error': 'Sender identity not found.'}, status=400)

        campaign = Campaign.objects.create(
            name=d.get('name', 'Untitled Campaign'),
            template=template,
            sender_identity=sender,
            subject=d.get('subject', ''),
            recipients=d.get('recipients', []),
            recipient_count=len(d.get('recipients', [])),
            scheduled_at=d.get('scheduled_at') or None,
            notes=d.get('notes', ''),
            created_by=request.user,
        )
        return Response({'id': campaign.pk, 'name': campaign.name, 'status': campaign.status}, status=201)


class CampaignDetailView(APIView):
    """Retrieve or update a campaign."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        from emails.models import Campaign
        try:
            c = Campaign.objects.select_related('template', 'sender_identity', 'created_by').get(pk=pk)
        except Campaign.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        return Response({
            'id':               c.pk,
            'name':             c.name,
            'template_id':      c.template.template_id if c.template else None,
            'template_name':    c.template.name if c.template else None,
            'sender_email':     c.sender_identity.email if c.sender_identity else None,
            'sender_name':      c.sender_identity.display_name if c.sender_identity else None,
            'subject':          c.subject,
            'recipients':       c.recipients,
            'recipient_count':  c.recipient_count,
            'status':           c.status,
            'delivery_rate':    c.delivery_rate,
            'open_rate':        c.open_rate,
            'click_rate':       c.click_rate,
            'bounce_rate':      c.bounce_rate,
            'delivered_count':  c.delivered_count,
            'open_count':       c.open_count,
            'click_count':      c.click_count,
            'bounce_count':     c.bounce_count,
            'scheduled_at':     c.scheduled_at.isoformat() if c.scheduled_at else None,
            'sent_at':          c.sent_at.isoformat() if c.sent_at else None,
            'notes':            c.notes,
            'created_by':       c.created_by.email if c.created_by else None,
            'created_at':       c.created_at.isoformat() if c.created_at else None,
        })

    def patch(self, request, pk):
        from emails.models import Campaign, EmailTemplate, SenderIdentity
        try:
            c = Campaign.objects.get(pk=pk)
        except Campaign.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        if c.status in ('sent', 'sending'):
            return Response({'error': 'Cannot edit a campaign that is already sent or sending.'}, status=400)

        d = request.data
        for field in ('name', 'subject', 'recipients', 'notes', 'scheduled_at'):
            if field in d:
                setattr(c, field, d[field])

        if d.get('template_id'):
            try:
                c.template = EmailTemplate.objects.get(template_id=d['template_id'], is_active=True)
            except EmailTemplate.DoesNotExist:
                return Response({'error': 'Template not found.'}, status=400)

        if d.get('sender_identity_id'):
            try:
                c.sender_identity = SenderIdentity.objects.get(pk=d['sender_identity_id'])
            except SenderIdentity.DoesNotExist:
                return Response({'error': 'Sender identity not found.'}, status=400)

        if 'recipients' in d:
            c.recipient_count = len(d['recipients'])

        c.save()
        return Response({'id': c.pk, 'name': c.name, 'status': c.status})

    def delete(self, request, pk):
        from emails.models import Campaign
        try:
            c = Campaign.objects.get(pk=pk)
        except Campaign.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        if c.status == 'sent':
            return Response({'error': 'Cannot delete a sent campaign.'}, status=400)
        c.delete()
        return Response({'deleted': True})


class CampaignSendView(APIView):
    """Trigger sending or cancel a campaign."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        from emails.service import EmailService
        result = EmailService.send_campaign(campaign_id=pk, actor=request.user)
        if result.get('error'):
            return Response(result, status=400)
        return Response(result)


class CampaignLogListView(APIView):
    """Per-recipient logs for a campaign."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        from emails.models import CampaignLog
        qs = CampaignLog.objects.filter(campaign_id=pk).order_by('-created_at')
        paginator = EmailLogPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                'id':        obj.pk,
                'recipient': obj.recipient,
                'status':    obj.status,
                'error':     obj.error_message,
                'sent_at':   obj.sent_at.isoformat() if obj.sent_at else None,
            }
            for obj in page
        ]
        return paginator.get_paginated_response(data)


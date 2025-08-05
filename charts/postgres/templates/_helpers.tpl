{{- define "postgres.name" -}}
postgres
{{- end }}

{{- define "postgres.fullname" -}}
{{ include "postgres.name" . }}-{{ .Release.Name }}
{{- end }}

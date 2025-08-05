{{- define "processor.name" -}}
processor
{{- end }}

{{- define "processor.fullname" -}}
{{ .Release.Name }}-{{ include "processor.name" . }}
{{- end }}

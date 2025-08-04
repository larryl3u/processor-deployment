{{- define "movement.name" -}}
movement
{{- end }}

{{- define "movement.fullname" -}}
{{ include "movement.name" . }}-{{ .Release.Name }}
{{- end }}


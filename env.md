
# Configuration for Kubernetes Deployment

The following configuration is required for Observatory API to work inside Kubernetes

## 1. Environment variables

|Variable Name|Value|Mandatory|Description|
|---|---|---|---|
|<span style="color:#FEB913">**AGENT SPECIFIC PARAMS**</span> ||||
|**VERSION**|0.1.0|**Yes**|Version of the Observatory Web installed|
|**BASE_API_URL**|https://admin-pr557.dev1.flowxai.dev/ai-observatory|**Yes**|URL base for Observatory API |
|**PLAYGROUND_URL**|https://admin-pr557.dev1.flowxai.dev|**Yes**|URL to access API for agents in playground mode |
|<span style="color:#FEB913">**AUTH PARAMS** </span> ||||
|**KEYCLOAK_ISSUER**|https://auth-pr557.dev1.flowxai.dev/auth/realms/flowx|**Yes**|Url for Keycloak|
|**KEYCLOAK_SCOPES**|openid profile email offline_access|**Yes**|Scope in keycloak for access|
|**KEYCLOAK_REDIRECT_URI**|https://observatory-pr557.dev1.flowxai.dev|**Yes**|Where to redirect after login|
|**KEYCLOAK_CLIENT_ID**|flowx-platform-authenticate|**Yes**|Client Id for authentication in Keycloak|

## 2. Volumes

|Volume Name|Size Limit|Mount Path|Description|
|---|---|---|---|
|**tmp-data**|500Mi|/tmp|Temporary folder for install and other tasks|

## 3. Resources

|Type|Memory|Cpu|Gpu|
|---|---|---|--|
|**limits**|4Gi|2|None|
|**requests**|512Mi|100m|None|



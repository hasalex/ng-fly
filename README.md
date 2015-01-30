WildFly
----

It works with WildFly 8.2. It doesn't work with previous versions because they are not dealing with errors in the some way.


Apache Configuration
----

This configuration allows any Origin, with credentials.

    Listen 90
    <VirtualHost *:90>

        ProxyRequests Off
        SetEnvIf Origin "^http://.*$" origin=$0
        Header always set Access-Control-Allow-Origin %{origin}e env=origin
        Header always set Access-Control-Allow-Methods "POST"
        Header always set Access-Control-Allow-Headers "content-type"
        Header always set Access-Control-Allow-Credentials "true"
        RequestHeader unset Origin

        RewriteEngine on
        RewriteCond %{REQUEST_METHOD} !OPTIONS
        RewriteRule ^/management$ http://localhost:9990/management [P]
        RewriteRule ^/management/(.*)$ http://localhost:9990/management/$1 [P]
        RewriteCond %{REQUEST_METHOD} OPTIONS
        RewriteRule ^(.*)$ $1 [R=200,L]
        ProxyPassReverse /management http://localhost:9990/management

    </VirtualHost>



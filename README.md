NG-Fly
====

It works with WildFly 9. CORS must be enabled on the management interface.

It may work with WildFly 8.2 as well, but will need the next Apache configuration. It doesn't work with previous versions because they are not dealing with errors in the some way.

The support of WildFly 10 is on the way...

Management Configuration
----

First of all, you have to add a user with bin/add-user.sh. You'll use this credentials to log in NG-Fly.

Second step, you have to enable CORS. With jboss-cli :

    /core-service=management/management-interface=http-interface:write-attribute(name=allowed-origins, value=["http://localhost:8888"])
    :reload

Apache Configuration
----

This configuration allows any Origin, with credentials. It can be used with any version of WildFly, and is the only way to make it work for WildFly 8.

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

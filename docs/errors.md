Main kinds of errors
====

Error on connection
----

State field should show a message like "Not connected"

The cause of the failure could be cool, if known : unable to join the server, not a management address, origin not authorized,...

Error on request
----

State field should show a message like "running", and the bottom of the form shows the error message


"nillable" => false
====

When calling an 'undefine-attribute' for a non-nillable attribute, the following errors happens :

* Http Status : 500

      {
        "outcome" : "failed",
        "failure-description" : "WFLYCTL0155: ***** may not be null",
        "rolled-back" : true
      }

This 'failure-description' is the WildFly 9 one. On WildFly 8, the 'failure-description' has the code JBAS014746.

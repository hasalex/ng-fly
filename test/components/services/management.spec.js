'use strict';

describe('Management', function () {
    var management;
    var $rootScope, $q;

    var TEST_RESOURCE = {"ATTR1": "VALUE1", "ATTR2": "VALUE2"};

    beforeEach(module('services'));

    beforeEach(function () {
        module('ngRoute');
        module('ui.bootstrap.modal');
    });

    beforeEach(inject(function (_management_, _$rootScope_, _$q_) {
        management = _management_;
        management.server = {url: "server"};
        management.name = null;
        management.names = [];

        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    describe('processError', function () {
        it('should set server state to empty when data and status are empty', function () {
            var data = {};
            var status = null;

            management.processError(data, status);

            expect(management.current.message).toBe('');
            expect(management.server.state).toBe('');
            expect(management.server.processState).toBe('');
            expect(management.server.stateClass).toBe('has-error');
        });

        it('should set server state to a constant text when status is greater than 300', function () {
            var data = {};
            var status = 300;

            management.processError(data, status);

            expect(management.current.message).toBe('');
            expect(management.server.state).toBe('Unknown Error');
            expect(management.server.processState).toBe('');
            expect(management.server.stateClass).toBe('has-error');
        });

        it('should set server state ends with the status when status is between 0 and 300', function () {
            var data = {};
            var status = 1;

            management.processError(data, status);

            expect(management.current.message).toBe('');
            expect(management.server.state).toBe('Error ' + status);
            expect(management.server.processState).toBe('');
            expect(management.server.stateClass).toBe('has-error');
        });

        it('should set server state to empty when status is 0', function () {
            var data = {"failure-description": "XXX"};
            var status = 0;

            management.processError(data, status);

            expect(management.current.message).toBe('XXX');
            expect(management.server.state).toBe('');
            expect(management.server.processState).toBe('');
            expect(management.server.stateClass).toBe('has-error');
        });
    });

    describe('invoke', function () {
        var httpBackend;
        var address, operation;

        beforeEach(inject(function ($httpBackend) {
            httpBackend = $httpBackend;
            spyOn(management, 'processSuccess');

            operation = 'op';
            address = [{"subsystem": "sub"}];
        }));

        it('should call processSuccess', function () {
            httpBackend
                .expectPOST('http://server/management')
                .respond({"response-headers": {}});

            var promise = management.invoke(operation, address);

            httpBackend.flush();
            expect(management.processSuccess).toHaveBeenCalled();
            promise.then(
                function () {
                },
                function () {
                    this.fail(Error(this.description + ' not have failed'));
                }.bind(this));
            $rootScope.$digest();

        });

        it('should not call a fail a success', function () {
            httpBackend
                .expectPOST('http://server/management')
                .respond(500, {});

            var promise = management.invoke(operation, address);

            httpBackend.flush();
            expect(management.processSuccess).not.toHaveBeenCalled();
            promise.then(
                function () {
                    this.fail(Error(this.description + ' have failed'));
                }.bind(this));
            $rootScope.$digest();
        });
    });

    describe('list', function () {
        it('should put the data result in the names', function () {
            spyOnInvoke({result: ["VALUE1", "VALUE2"]});

            management.list();
            $rootScope.$digest();

            expect(management.names.length).toBe(2);
        });
    });

    describe('load', function () {
        it('should do nothing when no name', function () {
            management.resource = null;
            management.name = null;
            spyOnInvoke({});

            management.load();
            $rootScope.$digest();

            expect(management.invoke).not.toHaveBeenCalled();
            expect(management.resource).toEqual({});
        });

        it('should load from address when having a name', function () {
            management.resource = null;
            management.resourceType = 'TYPE';
            management.name = 'NAME';
            management.rootAddress = [{"FIRST-LEVEL": "FIRST-VALUE"}];
            spyOnInvoke({result: TEST_RESOURCE});

            management.load();
            $rootScope.$digest();

            expect(management.invoke).toHaveBeenCalled();
            expect(management.resource).toEqual({
                "ATTR1": "VALUE1", "ATTR2": "VALUE2",
                address: [{"FIRST-LEVEL": "FIRST-VALUE"}, {"TYPE": "NAME"}]
            });
        });
    });

    describe('save', function () {
        it('should do nothing when no name', function () {
            spyOnInvoke({result: ["VALUE1", "VALUE2"]});

            management.save();
            $rootScope.$digest();

            expect(management.invoke).not.toHaveBeenCalled();
        });

        it('should save attribute when having a name', function () {
            management.resource = TEST_RESOURCE;
            management.resourceType = 'TYPE';
            management.name = 'NAME';
            management.rootAddress = [{"FIRST-LEVEL": "FIRST-VALUE"}];
            spyOnInvoke(TEST_RESOURCE);

            management.save('ATTR1');
            $rootScope.$digest();

            expect(management.invoke.calls.mostRecent().args[0]).toBe('write-attribute');
            expect(management.invoke).toHaveBeenCalled();
        });

        it('should undefine attribute when attr is null', function () {
            management.resource = TEST_RESOURCE;
            management.resourceType = 'TYPE';
            management.name = 'NAME';
            management.rootAddress = [{"FIRST-LEVEL": "FIRST-VALUE"}];
            spyOnInvoke(TEST_RESOURCE);

            management.save('ATTR3');
            $rootScope.$digest();

            expect(management.invoke.calls.mostRecent().args[0]).toBe('undefine-attribute');
            expect(management.invoke).toHaveBeenCalled();
        });
    });

    describe('remove', function () {
        it('should do nothing when no name', function () {
            management.resource = null;
            management.name = null;
            spyOnInvoke({});

            management.remove();
            $rootScope.$digest();

            expect(management.invoke).not.toHaveBeenCalled();
            expect(management.resource).toEqual({});
        });

        it('should remove from address when having a name', function () {
            management.resource = TEST_RESOURCE;
            management.resourceType = 'TYPE';
            management.name = 'NAME';
            management.rootAddress = [{"FIRST-LEVEL": "FIRST-VALUE"}];
            spyOnInvoke({result: TEST_RESOURCE});

            management.remove();
            $rootScope.$digest();

            expect(management.invoke).toHaveBeenCalled();
            expect(management.invoke.calls.argsFor(0)[0]).toBe('remove');

            expect(management.resource).toEqual({});
        });
    });


    // Utility functions
    function spyOnInvoke(data) {
        var deferred = $q.defer();
        deferred.resolve(data);
        spyOn(management, 'invoke').and.returnValue(deferred.promise);
    }

});
'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function () {

    browser.get('/');

    describe('home page', function () {

        it('should have an empty main menu', function () {
            expect($('#main-menu').isPresent()).toBe(false);
        });

        it('should fill the main menu when connected to the server', function () {
            $('#server-url')
                .sendKeys(':90')
                .sendKeys(protractor.Key.TAB);

            expect($('#main-menu').isPresent()).toBe(true);
            expect($('#main-menu').$$('li').count()).toBe(5);
            expect(element(by.model('management.server.state')).getAttribute('value')).toBe('running');
        });

    });

    describe('datasources page', function () {

        it('should work', function () {
            browser.setLocation('datasource?name=ExampleDS').then(function () {
                expect($('form').isPresent()).toBe(true);

                expect($('form').$('select').isPresent()).toBe(true);
                expect($('form').$('select').$('option:checked').getText()).toBe('ExampleDS');
            });
        });


    });
});

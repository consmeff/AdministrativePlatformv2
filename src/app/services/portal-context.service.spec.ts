import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PortalContextService } from './portal-context.service';

describe('PortalContextService', () => {
  let service: PortalContextService;
  let currentUrl: string;

  function signInAs(userType: string): void {
    sessionStorage.setItem('USER_TYPE', userType);
  }

  beforeEach(() => {
    sessionStorage.clear();
    currentUrl = '/pages/dashboard';
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            get url() {
              return currentUrl;
            },
            navigateByUrl: jasmine.createSpy('navigateByUrl'),
          },
        },
      ],
    });
    service = TestBed.inject(PortalContextService);
  });

  afterEach(() => sessionStorage.clear());

  describe('home role from user_type', () => {
    const cases: [string, string, string][] = [
      ['Provost', 'provost', '/pages/provost/dashboard'],
      ['board member', 'board', '/pages/board/dashboard'],
      ['HOD', 'hod', '/pages/hod/dashboard'],
      ['Lecturer', 'lecturer', '/pages/lecturer/dashboard'],
      ['Academic Officer', 'admin', '/pages/dashboard'],
    ];

    for (const [userType, role, dashboard] of cases) {
      it(`maps "${userType}" to ${role}`, () => {
        signInAs(userType);
        expect(service.getHomeRole()).toBe(role as never);
        expect(service.getHomeDashboardRoute()).toBe(dashboard);
      });
    }

    it('prefers provost when the label mentions both', () => {
      signInAs('Provost (Board)');
      expect(service.getHomeRole()).toBe('provost');
    });
  });

  describe('current portal from URL', () => {
    it('resolves board and provost prefixes, including query strings', () => {
      currentUrl = '/pages/board/expenses?page=2';
      expect(service.isBoardContext()).toBeTrue();
      expect(service.getRoleBasePath()).toBe('/pages/board');

      currentUrl = '/pages/provost';
      expect(service.isProvostContext()).toBeTrue();
    });

    it('does not treat look-alike paths as a portal', () => {
      signInAs('Academic Officer');
      currentUrl = '/pages/boardroom';
      expect(service.isBoardContext()).toBeFalse();
      expect(service.isAdminContext()).toBeTrue();
    });

    it('keeps a provost in the provost portal on shared admin pages', () => {
      signInAs('Provost');
      currentUrl = '/pages/applicants/applicantlist?programme=ond';
      expect(service.isProvostContext()).toBeTrue();
      expect(service.isAdminContext()).toBeFalse();
    });

    it('still honours the admin switch for HOD staff', () => {
      signInAs('HOD');
      sessionStorage.setItem('ACTIVE_PORTAL', 'admin');
      currentUrl = '/pages/applicants';
      expect(service.isAdminContext()).toBeTrue();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { APP_PERMISSIONS } from '../constants/permissions.constants';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
  });

  afterEach(() => sessionStorage.clear());

  describe('executive fallback when the backend sends no permissions', () => {
    it('grants a Board user view-only income and expenses', () => {
      service.setFromLogin([], [], 'Board');

      expect(service.has(APP_PERMISSIONS.VIEW_PAYMENTS)).toBeTrue();
      expect(service.has(APP_PERMISSIONS.VIEW_EXPENSES)).toBeTrue();
      expect(service.has(APP_PERMISSIONS.CREATE_EXPENSES)).toBeFalse();
      expect(service.has(APP_PERMISSIONS.VIEW_USERS)).toBeFalse();
    });

    it('grants a Provost user the board set plus staff and applicants', () => {
      service.setFromLogin([], [], 'Provost');

      expect(service.has(APP_PERMISSIONS.VIEW_PAYMENTS)).toBeTrue();
      expect(service.has(APP_PERMISSIONS.VIEW_EXPENSES)).toBeTrue();
      expect(service.has(APP_PERMISSIONS.VIEW_USERS)).toBeTrue();
      expect(service.has(APP_PERMISSIONS.VIEW_APPLICANTS)).toBeTrue();
      expect(service.has(APP_PERMISSIONS.VIEW_APPLICATIONS)).toBeTrue();
      expect(service.has(APP_PERMISSIONS.CREATE_USERS)).toBeFalse();
      expect(service.has(APP_PERMISSIONS.MANAGE_APPLICANTS)).toBeFalse();
    });

    it('treats null permissions like an empty list', () => {
      service.setFromLogin(null, null, 'Board');
      expect(service.has(APP_PERMISSIONS.VIEW_PAYMENTS)).toBeTrue();
    });

    it('persists the fallback so it survives a reload', () => {
      service.setFromLogin([], [], 'Provost');
      const stored: string[] = JSON.parse(
        sessionStorage.getItem('PERMISSIONS') ?? '[]',
      );
      expect(stored).toContain(APP_PERMISSIONS.VIEW_USERS);
    });
  });

  it('uses issued permissions instead of the fallback', () => {
    service.setFromLogin([APP_PERMISSIONS.CREATE_EXPENSES], [], 'Board');

    expect(service.has(APP_PERMISSIONS.CREATE_EXPENSES)).toBeTrue();
    expect(service.has(APP_PERMISSIONS.VIEW_PAYMENTS)).toBeFalse();
  });

  it('grants nothing to other user types with no permissions', () => {
    service.setFromLogin([], [], 'Lecturer');
    expect(service.grantedPermissions()).toEqual([]);
  });
});

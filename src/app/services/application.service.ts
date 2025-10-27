import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationListResponse } from '../model/dashboard/applicant';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  apiRoot = environment.apiURL;
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private http: HttpClient) {

   


  }

  getapplications(keyword?: string,  page_size?: number,  page: number = 1, sortField?: string | undefined, sortOrder?: number | undefined): Observable<ApplicationListResponse> {
    const baseUrl = `${this.apiRoot}/api/v1/applicants`;
    const params = new URLSearchParams();
  
    if (keyword) params.append('keyword', keyword);
    if (sortField) params.append('ordering',sortOrder && sortOrder>0? "-"+sortField:sortField);
    if (page_size) params.append('page_size', page_size.toString());
    if (page) params.append('page', page.toString());
  
    const url = `${baseUrl}?${params.toString()}`;
    return this.http.get<ApplicationListResponse>(url);
  }

  getapplication(app_no:string):Observable<ApplicationListResponse>{

    const Url = `${this.apiRoot}/api/v1/applicants?application_no=${app_no}`;
    return this.http.get<ApplicationListResponse>(Url);
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../widgets/sidebar/sidebar.component';
import { TopbarComponent } from '../../../widgets/topbar/topbar.component';
import { WidgetService } from '../../../services/widget.service';
import { sidebarStateDTO } from '../../../model/page.dto';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApplicationService } from '../../../services/application.service';
import { AcademicHistory, Application, ApplicationListResponse, Certificate } from '../../../model/dashboard/applicant';
import { TabViewModule } from 'primeng/tabview';
import { BusyIndicatorService } from '../../../services/busy-indicator.service';

@Component({
  selector: 'app-applicantdetail',
  imports: [CommonModule, SidebarComponent, TopbarComponent, RouterModule, TabViewModule],
  templateUrl: './applicantdetail.component.html',
  styleUrl: './applicantdetail.component.scss'
})
export class ApplicantdetailComponent implements OnInit {

  sidebarVisible = false;
  _widgetService = inject(WidgetService)
  _applicationservice = inject(ApplicationService);
  application: Application = {} as Application;
  route = inject(ActivatedRoute);
  
  app_no: string | null = "";

  constructor() {
    this._widgetService.sidebarState$.subscribe((state: sidebarStateDTO) => {
      this.sidebarVisible = state.isvisible;
    })

    this.app_no = this.route.snapshot.paramMap.get('appno');


  }
  ngOnInit(): void {
    
    this.app_no = this.app_no!.replaceAll("_", "/");

    this._applicationservice.getapplication(this.app_no!).subscribe((data: ApplicationListResponse) => {

      if (data.data.length > 0) {
        this.application = data.data[0];
        
      }

    })
  }

  getAcademicHistory(name: string): AcademicHistory | undefined {
    if (name == "primary") {
      return this.application.academic_history.filter(f => f.certificate_type == 'Primary School Leaving Certificate')[0]
    } else if (name == "secondary") {
      return this.application.academic_history.filter(f => f.certificate_type == 'SSSCE')[0]
    } else {
      return undefined;
    }
  }
  getAttemptCount(): number {
    return this.application.academic_history.filter(f => f.certificate_type == 'SSSCE').length
  }

  getSubjects(): string {
    let subjects = this.application.o_level_result![0].subjects;
    const subjectFormats: Record<string, string> = {
      english: "English Language",
      math: "Mathematics",
      physics: "Physics",
      chemistry: "Chemistry",
      biology: "Biology"
    };

    return subjects.map(item => {
      const formattedSubject = subjectFormats[item.subject.toLowerCase()] ||
        item.subject.charAt(0).toUpperCase() + item.subject.slice(1);
      return `${formattedSubject} - ${item.grade.toUpperCase()}`;
    }).join(", ");
  }


  getYear(): number | null {
    let input = this.application.o_level_result![0].name;
    const yearMatches = input.match(/\b(20\d{2}|19\d{2})\b/g);

    if (!yearMatches || yearMatches.length === 0) {
      // Try matching 2-digit years (like '25 in "sscc/2025")
      const shortYearMatch = input.match(/\b\d{2}\b/);
      if (shortYearMatch) {
        const shortYear = parseInt(shortYearMatch[0]);
        // Assuming years 00-79 are 2000-2079, 80-99 are 1980-1999
        return shortYear >= 80 ? 1900 + shortYear : 2000 + shortYear;
      }
      return null;
    }

    // Convert all matches to numbers and return the largest (most recent) one
    const years = yearMatches.map(match => parseInt(match));
    return Math.max(...years);
  }

  getExamName(): string {
    let input = this.application.o_level_result![0].name;
    let text = input.replace(/\s*\b(20\d{2}|19\d{2})\b\s*/g, ' ') // Remove 4-digit years
      .replace(/\s*\b\d{2}\b\s*/g, ' ')             // Remove 2-digit years
      .replace(/\s*\/\s*\d+\s*/g, ' ')               // Remove /2025, /23, etc.
      .trim();

    // Step 2: Clean up extra spaces and dangling punctuation
    text = text.replace(/\s+/g, ' ')          // Collapse multiple spaces
      .replace(/\s*-\s*/g, ' ')      // Remove standalone hyphens
      .replace(/\s*,\s*$/, '')       // Remove trailing commas
      .replace(/\s*\)\s*/g, ' ')     // Remove standalone closing parentheses
      .replace(/\s*\(\s*/g, ' ')     // Remove standalone opening parentheses
      .trim();

    // Step 3: Preserve acronyms in parentheses (e.g., "(WASSCE)") but clean the rest
    const acronymRegex = /\(([A-Z]+)\)/g;
    const acronyms: string[] = [];
    let match;
    while ((match = acronymRegex.exec(input)) !== null) {
      acronyms.push(match[1]);
    }

    // Reattach acronyms if they existed (e.g., "WEST AFRICAN... (WASSCE)")
    if (acronyms.length > 0) {
      text = text.replace(/\s*\([^)]*\)\s*/g, ''); // Remove all parentheses content
      text = `${text} (${acronyms.join(') (')})`;  // Re-add only the acronyms
    }

    return text || input; // Fallback to original if empty
  }


  getfileName(fileobj: Certificate): string {
    let extension = '';

    if(!fileobj) return "";
    if (fileobj.file_type) {
      const typeParts = fileobj.file_type.split('/');
      if (typeParts.length > 1) {
        extension = typeParts[1];
      }
    }


    if (!extension && fileobj.file_url) {
      const urlParts = fileobj.file_url.split('.');
      if (urlParts.length > 1) {
        extension = urlParts[urlParts.length - 1].split(/[?#]/)[0];
      }
    }


    let fileName = fileobj.file_name.trim();
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex > 0) { // Remove existing extension if present
      fileName = fileName.substring(0, lastDotIndex);
    }


    return extension ? `${fileName}.${extension}` : fileName;
  }

  formatFileSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Handle cases where we might get -0 or similar
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));

    return `${value} ${sizes[i]}`;
  }



}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HodStudentRecord, HodStudentRecordDrawerTab } from '../hod.types';

interface StudentRecordDrawerTabOption {
  label: string;
  value: HodStudentRecordDrawerTab;
}

@Component({
  selector: 'app-student-record-details-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-record-details-drawer.component.html',
  styleUrl: './student-record-details-drawer.component.scss',
})
export class StudentRecordDetailsDrawerComponent {
  @Input() record: HodStudentRecord | null = null;
  @Input() activeTab: HodStudentRecordDrawerTab = 'personal_details';
  @Output() closed = new EventEmitter<void>();
  @Output() activeTabChange = new EventEmitter<HodStudentRecordDrawerTab>();

  readonly drawerTabs: StudentRecordDrawerTabOption[] = [
    { label: 'Personal details', value: 'personal_details' },
    { label: 'Academic performance', value: 'academic_performance' },
    { label: 'Documents', value: 'documents' },
  ];

  getAvatarText(studentName: string): string {
    const nameParts = studentName
      .replace(',', ' ')
      .split(' ')
      .map((namePart) => namePart.trim())
      .filter(Boolean);

    return nameParts
      .slice(0, 2)
      .map((namePart) => namePart.charAt(0).toUpperCase())
      .join('');
  }

  viewDocument(previewUrl: string): void {
    globalThis.open(previewUrl, '_blank', 'noopener,noreferrer');
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';

interface ExamStatusOption {
  label: string;
  value: 'all' | 'qualified' | 'unqualified' | 'absent';
}

interface ExamResultRow {
  applicationNo: string;
  fullName: string;
  submittedAt: string;
  programme: string;
  obtainable: number;
  cutOff: number;
  obtained: number;
  statusLabel: string;
  statusCode: 'qualified' | 'unqualified' | 'absent';
}

@Component({
  selector: 'app-exam-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    PaginatorModule,
  ],
  templateUrl: './exam-management.component.html',
  styleUrl: './exam-management.component.scss',
})
export class ExamManagementComponent implements OnInit {
  searchText = '';

  readonly statusOptions: ExamStatusOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Qualified Candidates', value: 'qualified' },
    { label: 'Unqualified Candidates', value: 'unqualified' },
    { label: 'Absent Candidates', value: 'absent' },
  ];
  selectedStatus: ExamStatusOption = this.statusOptions[0];

  readonly rows = 10;
  first = 0;

  allResults: ExamResultRow[] = [];
  filteredResults: ExamResultRow[] = [];

  readonly columns = [
    { field: 'applicationNo', header: 'Application Number' },
    { field: 'fullName', header: 'Full Name' },
    { field: 'submittedAt', header: 'Submission Date' },
    { field: 'programme', header: 'Pref. Programme' },
    { field: 'obtainable', header: 'Obtainable' },
    { field: 'cutOff', header: 'Cut - Off' },
    { field: 'obtained', header: 'Obtained' },
    { field: 'statusLabel', header: 'Status' },
  ];

  ngOnInit(): void {
    this.allResults = this.buildMockResults();
    this.applyFilters();
  }

  onSearchChange(): void {
    this.first = 0;
    this.applyFilters();
  }

  onStatusChange(): void {
    this.first = 0;
    this.applyFilters();
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
  }

  get pagedResults(): ExamResultRow[] {
    return this.filteredResults.slice(this.first, this.first + this.rows);
  }

  getStatusClass(statusCode: ExamResultRow['statusCode']): string {
    if (statusCode === 'qualified') {
      return 'status-qualified';
    }
    if (statusCode === 'unqualified') {
      return 'status-unqualified';
    }
    return 'status-absent';
  }

  private applyFilters(): void {
    const keyword = this.searchText.trim().toLowerCase();

    this.filteredResults = this.allResults.filter((row) => {
      const statusPass =
        this.selectedStatus.value === 'all' ||
        row.statusCode === this.selectedStatus.value;

      if (!statusPass) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        row.applicationNo.toLowerCase().includes(keyword) ||
        row.fullName.toLowerCase().includes(keyword) ||
        row.programme.toLowerCase().includes(keyword)
      );
    });
  }

  private buildMockResults(): ExamResultRow[] {
    const programs = ['Nursing', 'Public Health', 'Midwifery', 'Pharmacy'];
    const names = [
      'Gbadegesi Ishola',
      'Adebayo Tunde',
      'Okafor Chika',
      'Usman Aisha',
      'Yakub Ajibade',
      'Omotosho Bisi',
      'Ibrahim Musa',
      'Eze Kene',
      'Lawal Sade',
      'Balogun David',
      'Nwosu Favour',
      'Akinyemi Kemi',
    ];

    return Array.from({ length: 80 }).map((_, index) => {
      const programme = programs[index % programs.length];
      const fullName = names[index % names.length];
      const obtainable = 400;
      const cutOff = 220;

      const seed = index % 9;
      const statusCode: ExamResultRow['statusCode'] =
        seed === 0 ? 'absent' : seed <= 2 ? 'unqualified' : 'qualified';
      const obtained =
        statusCode === 'absent'
          ? 0
          : statusCode === 'qualified'
            ? 225 + (index % 120)
            : 160 + (index % 50);

      return {
        applicationNo: `CONSMMEFS/ENT-2025/${String(index + 1).padStart(4, '0')}`,
        fullName,
        submittedAt: '24/02/25 | 09:08:23',
        programme,
        obtainable,
        cutOff,
        obtained,
        statusLabel:
          statusCode === 'qualified'
            ? 'Passed'
            : statusCode === 'unqualified'
              ? 'Failed'
              : 'Absent',
        statusCode,
      };
    });
  }
}

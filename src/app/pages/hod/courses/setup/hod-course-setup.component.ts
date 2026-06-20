import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../widgets/button/button.component';
import { FilterSelectComponent } from '../../../../widgets/filter-select/filter-select.component';
import { SearchInputComponent } from '../../../../widgets/search-input/search-input.component';
import { HOD_COURSE_LEVEL_FILTER_OPTIONS } from '../../hod.constants';
import { HodStateService } from '../../hod-state.service';
import {
  HodCourseCatalogueCourse,
  HodCourseLevelSelection,
  HodCourseRequirementType,
  HodLevelFilterOption,
} from '../../hod.types';
import { CoursePublicationHistoryModalComponent } from '../course-publication-history-modal.component';

type CourseSetupStage = 'empty' | 'catalogue' | 'classification';

interface CourseCatalogueSection {
  label: string;
  courses: HodCourseCatalogueCourse[];
}

@Component({
  selector: 'app-hod-course-setup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SearchInputComponent,
    FilterSelectComponent,
    ButtonComponent,
    CoursePublicationHistoryModalComponent,
  ],
  templateUrl: './hod-course-setup.component.html',
  styleUrl: './hod-course-setup.component.scss',
})
export class HodCourseSetupComponent {
  private readonly hodStateService = inject(HodStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly levelOptions = HOD_COURSE_LEVEL_FILTER_OPTIONS;
  readonly selectedLevel = signal<HodLevelFilterOption>(
    this.resolveInitialLevelOption(),
  );
  readonly stage = signal<CourseSetupStage>('empty');
  readonly catalogueSearchTerm = signal('');
  readonly selectedCourseIds = signal<string[]>([]);
  readonly requirementMap = signal<Record<string, HodCourseRequirementType>>(
    {},
  );
  readonly expandedSections = signal<string[]>([]);
  readonly historyVisible = signal(false);
  readonly publicationHistory = this.hodStateService.coursePublicationHistory;

  constructor() {
    this.syncLevelState(this.selectedLevel().value);
  }

  readonly filteredCatalogueCourses = () => {
    const normalizedSearchTerm = this.catalogueSearchTerm()
      .trim()
      .toLowerCase();

    return this.hodStateService
      .courseCatalogueCourses()
      .filter((course) => course.levelValue === this.selectedLevel().value)
      .filter((course) => {
        if (!normalizedSearchTerm) {
          return true;
        }

        return (
          course.code.toLowerCase().includes(normalizedSearchTerm) ||
          course.title.toLowerCase().includes(normalizedSearchTerm)
        );
      });
  };

  readonly catalogueSections = () => {
    const courseMap = new Map<string, HodCourseCatalogueCourse[]>();

    this.filteredCatalogueCourses().forEach((course) => {
      const existingCourses = courseMap.get(course.categoryLabel) ?? [];
      courseMap.set(course.categoryLabel, [...existingCourses, course]);
    });

    return Array.from(courseMap.entries()).map(
      ([label, courses]): CourseCatalogueSection => ({
        label,
        courses,
      }),
    );
  };

  readonly selectedCourses = () => {
    const selectedCourseIdSet = new Set(this.selectedCourseIds());

    return this.hodStateService
      .courseCatalogueCourses()
      .filter(
        (course) =>
          course.levelValue === this.selectedLevel().value &&
          selectedCourseIdSet.has(course.id),
      )
      .sort(
        (firstCourse, secondCourse) =>
          this.selectedCourseIds().indexOf(firstCourse.id) -
          this.selectedCourseIds().indexOf(secondCourse.id),
      );
  };

  onLevelChange(level: HodLevelFilterOption): void {
    this.selectedLevel.set(level);
    this.syncLevelState(level.value);
  }

  onCatalogueSearchTermChange(searchTerm: string): void {
    this.catalogueSearchTerm.set(searchTerm);
  }

  startSelection(): void {
    this.stage.set('catalogue');
  }

  toggleCourseSelection(courseId: string): void {
    if (this.selectedCourseIds().includes(courseId)) {
      this.removeSelectedCourse(courseId);
      return;
    }

    this.selectedCourseIds.update((selectedCourseIds) => [
      ...selectedCourseIds,
      courseId,
    ]);
    this.requirementMap.update((requirementMap) => ({
      ...requirementMap,
      [courseId]: requirementMap[courseId] ?? 'compulsory',
    }));
  }

  removeSelectedCourse(courseId: string): void {
    this.selectedCourseIds.update((selectedCourseIds) =>
      selectedCourseIds.filter(
        (selectedCourseId) => selectedCourseId !== courseId,
      ),
    );
    this.requirementMap.update((requirementMap) => {
      const nextRequirementMap = { ...requirementMap };
      delete nextRequirementMap[courseId];
      return nextRequirementMap;
    });
  }

  continueToClassification(): void {
    if (this.selectedCourseIds().length === 0) {
      return;
    }

    this.stage.set('classification');
  }

  backToCatalogue(): void {
    this.stage.set('catalogue');
  }

  setRequirementType(
    courseId: string,
    requirementType: HodCourseRequirementType,
  ): void {
    this.requirementMap.update((requirementMap) => ({
      ...requirementMap,
      [courseId]: requirementType,
    }));
  }

  publish(): void {
    if (this.selectedCourseIds().length === 0) {
      return;
    }

    const selections: HodCourseLevelSelection[] = this.selectedCourseIds().map(
      (courseId) => ({
        courseId,
        requirementType: this.requirementMap()[courseId] ?? 'compulsory',
      }),
    );

    this.hodStateService.publishCourseLevelSelection(
      this.selectedLevel().value,
      selections,
    );
    this.router.navigate(['/pages/hod/courses']);
  }

  openHistory(): void {
    this.historyVisible.set(true);
  }

  closeHistory(): void {
    this.historyVisible.set(false);
  }

  duplicateHistoryLevel(levelValue: string): void {
    const matchingLevel =
      this.levelOptions.find(
        (levelOption) => levelOption.value === levelValue,
      ) ?? null;

    if (!matchingLevel) {
      return;
    }

    this.selectedLevel.set(matchingLevel);
    this.syncLevelState(levelValue);
    this.historyVisible.set(false);
  }

  toggleSection(sectionLabel: string): void {
    this.expandedSections.update((expandedSections) =>
      expandedSections.includes(sectionLabel)
        ? expandedSections.filter(
            (expandedSection) => expandedSection !== sectionLabel,
          )
        : [...expandedSections, sectionLabel],
    );
  }

  isSectionExpanded(sectionLabel: string): boolean {
    return this.expandedSections().includes(sectionLabel);
  }

  isCourseSelected(courseId: string): boolean {
    return this.selectedCourseIds().includes(courseId);
  }

  getRequirementType(courseId: string): HodCourseRequirementType {
    return this.requirementMap()[courseId] ?? 'compulsory';
  }

  private resolveInitialLevelOption(): HodLevelFilterOption {
    const requestedLevelValue = this.route.snapshot.queryParamMap.get('level');

    return (
      this.levelOptions.find(
        (option) => option.value === requestedLevelValue,
      ) ?? this.levelOptions[0]
    );
  }

  private syncLevelState(levelValue: string): void {
    const levelConfiguration =
      this.hodStateService.getCourseLevelConfiguration(levelValue);
    const selectedCourseIds =
      levelConfiguration?.selections.map((selection) => selection.courseId) ??
      [];
    const requirementMap = Object.fromEntries(
      (levelConfiguration?.selections ?? []).map((selection) => [
        selection.courseId,
        selection.requirementType,
      ]),
    ) as Record<string, HodCourseRequirementType>;
    const sectionLabels = Array.from(
      new Set(
        this.hodStateService
          .courseCatalogueCourses()
          .filter((course) => course.levelValue === levelValue)
          .map((course) => course.categoryLabel),
      ),
    );

    this.catalogueSearchTerm.set('');
    this.selectedCourseIds.set(selectedCourseIds);
    this.requirementMap.set(requirementMap);
    this.expandedSections.set(sectionLabels);
    this.stage.set(selectedCourseIds.length > 0 ? 'catalogue' : 'empty');
  }
}

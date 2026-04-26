import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges } from '@angular/core';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

@Component({
  selector: 'app-doughnut',
  imports: [CommonModule],
  templateUrl: './doughnut.component.html',
  styleUrl: './doughnut.component.scss',
})
export class DoughnutComponent implements OnInit, OnChanges {
  @Input() chartData: {
    shortlisted: number;
    pending: number;
    resubmitted: number;
    rejected: number;
  } = { shortlisted: 0, pending: 0, resubmitted: 0, rejected: 0 };

  chart?: Chart<'doughnut'>;
  legendItems: { label: string; value: number; color: string }[] = [];
  private colors = ['#0b1fa6', '#5f6bc8', '#9aa1e0', '#e6e9fb'];

  ngOnInit(): void {
    this.createChart();
    this.prepareLegendItems();
  }

  private prepareLegendItems(): void {
    this.legendItems = [
      {
        label: 'Shortlisted',
        value: this.chartData.shortlisted,
        color: this.colors[0],
      },
      {
        label: 'Pending',
        value: this.chartData.pending,
        color: this.colors[1],
      },
      {
        label: 'Resubmitted',
        value: this.chartData.resubmitted,
        color: this.colors[2],
      },
      {
        label: 'Rejected',
        value: this.chartData.rejected,
        color: this.colors[3],
      },
    ];
  }

  private createChart(): void {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    const ctx = document.getElementById('doughnutChart') as HTMLCanvasElement;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Shortlisted', 'Pending', 'Resubmitted', 'Rejected'],
        datasets: [
          {
            data: [
              this.chartData.shortlisted,
              this.chartData.pending,
              this.chartData.resubmitted,
              this.chartData.rejected,
            ],
            backgroundColor: this.colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // We'll use our custom legend
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = Number(context.raw) || 0;
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
        cutout: '60%',
      },
    });
  }

  ngOnChanges(): void {
    if (this.chart) {
      this.chart.data.datasets[0].data = [
        this.chartData.shortlisted,
        this.chartData.pending,
        this.chartData.resubmitted,
        this.chartData.rejected,
      ];
      this.chart.update();
      this.prepareLegendItems();
    }
  }
}

import React, { useEffect, useState } from 'react';
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { PerformanceSuggestion } from '../../types';

import { jsPDF } from "jspdf";
import {autoTable} from 'jspdf-autotable';



// autoTable(jsPDF.API, {});

export default function PerformancePage() {
  
  const { user } = useAuth();
  const [performance, setPerformance] = useState<PerformanceSuggestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPerformance();
    }
  }, [user]);

  const fetchPerformance = async () => {
    try {
      const data = await apiService.getPerformanceSuggestions();
      console.log("Mark data",data);
      
      setPerformance(data);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ****************************************************

const generatePDF = () => {
  if (!performance) return; // Don't run if no data

  const doc = new jsPDF();

  // 1. Title
  doc.setFontSize(18);
  doc.text("Performance Report", 14, 20);

  // 2. Overview Table
  doc.setFontSize(14);
  doc.text("Overall Performance", 14, 30);
  autoTable(doc, {
    startY: 35,
    head: [["Grade", "Percentage"]],
    body: [[performance.overall.grade, performance.overall.percentage.toFixed(1) + "%"]],
  });

  // 3. Key Insights
  const afterOverallTable = doc.lastAutoTable?.finalY || 35;
  doc.setFontSize(12);
  doc.text("Key Insights", 14, afterOverallTable + 10);

  performance.overall.suggestions.forEach((s, i) => {
    doc.text(`- ${s}`, 16, afterOverallTable + 16 + i * 6);
  });

  // 4. Subject-wise Summary Table
  const afterInsights = afterOverallTable + 16 + performance.overall.suggestions.length * 6 + 10;
  doc.text("Subject-wise Performance", 14, afterInsights);

  const subjectData = performance.subjects.map(sub => [
    sub.subject,
    sub.grade,
    sub.average.toFixed(1) + "%",
  ]);

  autoTable(doc, {
    startY: afterInsights + 5,
    head: [["Subject", "Grade", "Average %"]],
    body: subjectData,
  });

  // 5. Exam-wise breakdown per subject
  let lastY = doc.lastAutoTable?.finalY || afterInsights + 5;

  performance.subjects.forEach(sub => {
    if (sub.exams && sub.exams.length > 0) {
      lastY += 10;
      doc.text(`Exam-wise for ${sub.subject}`, 14, lastY);

      const examData = sub.exams.map((ex: any) => [
        ex.examName,
        ex.marksObtained,
        ex.maxMarks,
        ex.percentage.toFixed(1) + "%",
        ex.grade,
      ]);

      autoTable(doc, {
        startY: lastY + 5,
        head: [["Exam", "Marks Obtained", "Max Marks", "Percentage", "Grade"]],
        body: examData,
      });

      lastY = doc.lastAutoTable?.finalY || lastY + 5;
    }
  });

  // 6. Save PDF
  doc.save("Performance_Report.pdf");
};

  // ****************************************************

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0bf70d]"></div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No performance data available
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Performance suggestions will appear once you have marks recorded.
        </p>
      </div>
    );
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 dark:text-green-400';
    if (grade.startsWith('B')) return 'text-blue-600 dark:text-blue-400';
    if (grade.startsWith('C')) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-blue-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Performance Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed insights into your academic performance and suggestions for improvement
        </p>
      </div>
      <button
    onClick={generatePDF}
    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
  >
    Download Report
  </button>

      {/* Overall Performance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Overall Performance
          </h2>
          <div className="flex items-center space-x-2">
            <Award className="text-[#0bf70d]" size={24} />
            <span className={`text-2xl font-bold ${getGradeColor(performance.overall.grade)}`}>
              {performance.overall.grade}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Percentage
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {performance.overall.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getProgressColor(performance.overall.percentage)}`}
                  style={{ width: `${performance.overall.percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Key Insights:
              </h3>
              {performance.overall.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Target className="text-[#0bf70d] mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Performance Distribution
            </h3>
            <div className="space-y-2">
              {['A+ (95-100%)', 'A (90-94%)', 'B+ (85-89%)', 'B (80-84%)', 'C+ (75-79%)', 'Below C+ (<75%)'].map((range, index) => {
                const subjectsInRange = performance.subjects.filter(s => {
                  if (index === 0) return s.average >= 95;
                  if (index === 1) return s.average >= 90 && s.average < 95;
                  if (index === 2) return s.average >= 85 && s.average < 90;
                  if (index === 3) return s.average >= 80 && s.average < 85;
                  if (index === 4) return s.average >= 75 && s.average < 80;
                  return s.average < 75;
                });
                
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{range}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {subjectsInRange.length} subjects
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Subject-wise Performance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Subject-wise Analysis
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {performance.subjects.map((subject, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="text-[#0bf70d]" size={20} />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {subject.subject}
                  </h3>
                </div>
                <span className={`text-xl font-bold ${getGradeColor(subject.grade)}`}>
                  {subject.grade}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Average Score
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {subject.average.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(subject.average)}`}
                    style={{ width: `${subject.average}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Recommendations:
                </h4>
                {subject.suggestions.map((suggestion, suggestionIndex) => (
                  <p
                    key={suggestionIndex}
                    className="text-xs text-gray-600 dark:text-gray-400"
                  >
                    • {suggestion}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-[#0bf70d]/10 to-blue-500/10 p-6 rounded-lg border border-[#0bf70d]/20">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          General Study Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              For Improvement:
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Create a consistent study schedule</li>
              <li>• Focus on weak areas identified above</li>
              <li>• Practice regular self-assessment</li>
              <li>• Seek help from teachers when needed</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              To Maintain Excellence:
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Continue current study methods</li>
              <li>• Challenge yourself with advanced topics</li>
              <li>• Help peers in areas of strength</li>
              <li>• Set higher academic goals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
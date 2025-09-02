
import React, { useState, useEffect } from "react";
import StatsDashboard from "@/components/StatsDashboard";
import ProfileCard from "@/components/ProfileCard";
import TodaysTaskList from "@/components/TodaysTaskList";
import ReactiveBackground from "@/components/ReactiveBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TodayInfoBox from "@/components/TodayInfoBox";
import DayDetailPopover from "@/components/DayDetailPopover";
import ClassManager from "@/components/ClassManager";
import LabelStatsSection from "@/components/LabelStatsSection";
import AddTaskSection from "@/components/AddTaskSection";
import DashboardStatsCard from "@/components/DashboardStatsCard";

// Modified day types (no truancy!)
type DayType = "work" | "vacation" | "sickness";

// Add PieStat type directly in this file for type support
type PieStat = { completed: number; left: number };

function getInitialDays() {
  // Similar mockDays logic, simply use without truancy
  const result: { [key: string]: DayType } = {};
  const now = new Date();
  for (let i = 1; i <= 31; i++) {
    if (i % 6 === 0) result[new Date(now.getFullYear(), now.getMonth(), i).toDateString()] = "vacation";
    else if (i % 13 === 0) result[new Date(now.getFullYear(), now.getMonth(), i).toDateString()] = "sickness";
    else result[new Date(now.getFullYear(), now.getMonth(), i).toDateString()] = "work";
  }
  return result;
}

type TaskItem = { text: string; class?: string };

function getInitialDoneMap(eventsObj: { [key: string]: TaskItem[] }) {
  // Initialize each day to an empty array matching the number of events for that day
  const done: { [key: string]: boolean[] } = {};
  for (const key in eventsObj) {
    done[key] = eventsObj[key]?.map(() => false);
  }
  return done;
}

function getTodoCoverageStats(
  doneMap: { [key: string]: boolean[] },
  events: { [key: string]: TaskItem[] },
  range: { start: Date; end: Date },
  classFilter?: string
): { completed: number; left: number } {
  let completed = 0, left = 0;
  for (
    let d = new Date(range.start);
    d <= range.end;
    d.setDate(d.getDate() + 1)
  ) {
    const dayStr = new Date(d).toDateString();
    const eventsThisDay = events[dayStr] || [];
    const doneList = doneMap[dayStr] || [];
    eventsThisDay.forEach((task, i) => {
      if (classFilter && task.class !== classFilter) return;
      if (doneList[i]) completed++;
      else left++;
    });
  }
  return { completed, left };
}

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date()); // for calendar view
  const [days, setDays] = useState<{ [key: string]: DayType }>(getInitialDays);
  const [events, setEvents] = useState<{ [key: string]: TaskItem[] }>({});

  // Add state for task done tracking
  const [doneMap, setDoneMap] = useState<{ [key: string]: boolean[] }>(() =>
    getInitialDoneMap({})
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [classes, setClasses] = useState<string[]>([]);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUserId(data.userId);
        setError(null);

      } catch (err) {
        setError('Failed to fetch user profile');
        console.error('Error fetching user profile:', err);
      }
    };
   
    // Fetch tasks from API
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tasks', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setEvents(data.events);
        setDoneMap(data.doneMap);
        setClasses(data.classes);
        setDays(data.days);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // You might want to show an error message to the user
      }
    };
    fetchEvents();

  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            events,
            doneMap,
            classes,
            days
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save tasks');
        }
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };

    // Only save if there are actual tasks to save
    if (Object.keys(events).length > 0 || Object.keys(doneMap).length > 0 || classes.length > 0 || Object.keys(days).length > 0) {
      saveTasks();
    }
  }, [events, doneMap, classes, token, days]); // Watch for changes in events, doneMap, classes, and token


  const handleAddClass = (c: string) =>
    setClasses(prev => prev.includes(c) ? prev : [...prev, c]);
  const handleDeleteClass = (c: string) => setClasses(prev => prev.filter(x => x !== c));

  // The selected date string and info
  const selectedString = selectedDay?.toDateString() ?? "";
  const selectedType: DayType = days[selectedString] || "work";
  const selectedEvents: string[] = (events[selectedString] || []).map(ev => ev.text);

  // Only today's string and data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toDateString();

  // Handler for calendar click - only allow dates of today or newer
  const handleCalendarSelect = (d?: Date) => {
    if (!d) return;
    setDate(d);
    setDisplayMonth(new Date(d.getFullYear(), d.getMonth()));
    const clicked = new Date(d);
    clicked.setHours(0, 0, 0, 0);
    if (clicked >= today) {
      setSelectedDay(d);
      setDetailOpen(true);
    } else {
      // Don't show popover at all for past dates
      setDetailOpen(false);
      setSelectedDay(d); // still update selection
    }
  };

  const handleDayTypeChange = (t: DayType) => {
    if (selectedDay) {
      setDays((prev) => ({
        ...prev,
        [selectedDay.toDateString()]: t,
      }));
    }
  };

  // Extend onAddEvent for doneMap, now supports class
  const handleAddTask = (event: string, labelOverride?: string) => {
    const dayStr = selectedDay?.toDateString();
    if (!dayStr || !token) return;

    // Add task to frontend state
    enhancedHandleAddEvent(event, labelOverride);

    // Add task to backend
    fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date: dayStr,
        text: event,
        label: labelOverride || pendingClass
      })
    }).catch(error => console.error('Error adding task:', error));
  };

  const enhancedHandleAddEvent = (event: string, labelOverride?: string) => {
    if (selectedDay) {
      const dayStr = selectedDay.toDateString();
      setEvents((prev) => {
        const newTask: TaskItem = { text: event };
        if (typeof labelOverride === "string") newTask.class = labelOverride;
        else if (pendingClass) newTask.class = pendingClass;
        const newEvents = {
          ...prev,
          [dayStr]: [...(prev[dayStr] || []), newTask],
        };
        // Add new doneMap entry for new event
        setDoneMap((dPrev) => ({
          ...dPrev,
          [dayStr]: [...(dPrev[dayStr] || []), false],
        }));
        return newEvents;
      });
      setPendingClass(""); // reset after add
    }
  };

  // Extend remove event for doneMap
  const handleDeleteTask = (date: Date, index: number) => {
    const dayStr = date.toDateString();
    if (!token) return;

    setEvents((prev) => {
      const currentEvents = prev[dayStr] || [];
      const newEvents = { ...prev };
      newEvents[dayStr] = currentEvents.filter((_, i) => i !== index);
      return newEvents;
    });

    setDoneMap((prev) => {
      const currentDone = prev[dayStr] || [];
      const newDoneMap = { ...prev };
      newDoneMap[dayStr] = currentDone.filter((_, i) => i !== index);
      return newDoneMap;
    });

    // Delete task from backend
    fetch(`/api/tasks/${dayStr}/${index}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).catch(error => console.error('Error deleting task:', error));
  };

  const enhancedHandleRemoveEvent = (i: number) => {
    if (selectedDay) {
      handleDeleteTask(selectedDay, i);
    }
  };

  const handleTaskCompletion = (date: Date, index: number, isCompleted: boolean) => {
    const dayStr = date.toDateString();
    if (!token) return;

    setDoneMap((prev) => {
      const currentDone = prev[dayStr] || [];
      const newDoneMap = { ...prev };
      newDoneMap[dayStr] = [...currentDone];
      newDoneMap[dayStr][index] = isCompleted;
      return newDoneMap;
    });

    // Update task completion status on backend
    fetch(`/api/tasks/${dayStr}/${index}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isCompleted })
    }).catch(error => console.error('Error updating task:', error));
  };

  // Handler for toggling event done status
  const handleToggleDone = (idx: number) => {
    if (selectedDay) {
      const dayStr = selectedDay.toDateString();
      setDoneMap((prev) => {
        const arr = Array.isArray(prev[dayStr]) ? [...prev[dayStr]] : [];
        arr[idx] = !arr[idx];
        return {
          ...prev,
          [dayStr]: arr,
        };
      });
    }
  };

  // Calendar navigation handlers (month/year)
  const handleMonthChange = (inc: number) => {
    setDisplayMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + inc);
      return new Date(newDate.getFullYear(), newDate.getMonth());
    });
  };
  const handleYearChange = (inc: number) => {
    setDisplayMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + inc);
      return new Date(newDate.getFullYear(), newDate.getMonth());
    });
  };

  // The info box will now show selected date info
  const infoBoxDayType: DayType = selectedType;
  const infoBoxEvents: string[] = selectedEvents;
  const infoBoxDate: Date = selectedDay ?? today;
  const infoBoxDoneMap: boolean[] = doneMap[selectedString] || [];
  const isToday = selectedDay
    ? selectedDay.toDateString() === todayString
    : true;

  // Current selected day stats
  const selectedStats = React.useMemo(() => {
    const str = selectedDay ? selectedDay.toDateString() : today.toDateString();
    const eventsList = events[str] || [];
    const doneList = doneMap[str] || [];
    let completed = 0,
      left = 0;
    eventsList.forEach((task, i) => {
      if (doneList[i]) completed++;
      else left++;
    });
    return { completed, left };
  }, [selectedDay, events, doneMap, today]);

  // This month stats
  const thisMonthStats = React.useMemo(() => {
    const ref = selectedDay ?? today;
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    return getTodoCoverageStats(doneMap, events, { start, end });
  }, [selectedDay, events, doneMap, today]);

  // This year stats
  const thisYearStats = React.useMemo(() => {
    const ref = selectedDay ?? today;
    const start = new Date(ref.getFullYear(), 0, 1);
    const end = new Date(ref.getFullYear(), 11, 31);
    return getTodoCoverageStats(doneMap, events, { start, end });
  }, [selectedDay, events, doneMap, today]);

  // Modifier arrays for the calendar
  const mockDays = days;
  const modifiers = {
    work: Object.keys(mockDays).filter((d) => mockDays[d] === "work").map((d) => new Date(d)),
    vacation: Object.keys(mockDays).filter((d) => mockDays[d] === "vacation").map((d) => new Date(d)),
    sickness: Object.keys(mockDays).filter((d) => mockDays[d] === "sickness").map((d) => new Date(d)),
    today: [today],
  };

  // Pass if currently selected (side panel correlates with selectedDay)
  const isSelected = true;

  // class add/remove
  // Extract class list for dropdown
  const classOptions = classes;

  // --- When adding a task, select a class (optional) ---
  const [pendingClass, setPendingClass] = useState<string>("");

  // For per-class stats
  const classStats = React.useMemo(() => {
    const result: { [key: string]: { day: PieStat; month: PieStat; year: PieStat } } = {};
    for (const c of classes) {
      // 1. Selected date
      const str = selectedDay ? selectedDay.toDateString() : today.toDateString();
      const eventsList = events[str] || [];
      const doneList = doneMap[str] || [];
      let completed = 0,
        left = 0;
      eventsList.forEach((task, i) => {
        if (task.class !== c) return;
        if (doneList[i]) completed++;
        else left++;
      });
      const dayStat = { completed, left };

      // This month
      const ref = selectedDay ?? today;
      const startM = new Date(ref.getFullYear(), ref.getMonth(), 1);
      const endM = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
      const monthStat = getTodoCoverageStats(doneMap, events, { start: startM, end: endM }, c);

      // This year
      const startY = new Date(ref.getFullYear(), 0, 1);
      const endY = new Date(ref.getFullYear(), 11, 31);
      const yearStat = getTodoCoverageStats(doneMap, events, { start: startY, end: endY }, c);
      result[c] = { day: dayStat, month: monthStat, year: yearStat };
    }
    return result;
  }, [classes, selectedDay, events, doneMap, today]);

  // Handle AddTaskSection "add task" logic unified for both labeled and non-labeled tasks:
  const handleAddTaskWithLabel = (taskText: string, label?: string) => {
    enhancedHandleAddEvent(taskText, label);
  };

  return (
    <main className="relative min-h-screen bg-background dark:bg-gray-900 overflow-hidden">
      <ReactiveBackground bubbleMode={false} />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Profile Card */}
          <div className="space-y-6">
            <ProfileCard userId={userId} totalTasks={selectedStats.completed+ selectedStats.left} />-

            {/* Class Manager Section */}

          </div>

          {/* Right column - Calendar and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Calendar</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Calendar
                    mode="single"
                    selected={selectedDay || date}
                    onSelect={handleCalendarSelect}
                    month={displayMonth}
                    onMonthChange={setDisplayMonth}
                    className="rounded-md border pointer-events-auto"
                    modifiers={modifiers}
                    modifiersClassNames={{
                      work: "bg-yellow-400 text-white rounded-md",
                      vacation: "bg-gray-300 text-gray-800 rounded-md",
                      sickness: "bg-red-300 text-gray-900 rounded-md",
                      today: "ring-2 ring-primary ring-offset-2 font-bold rounded-md",
                    }}
                  />
                  {/* Legend */}
                  <div className="flex gap-4 mt-4 px-2 text-xs items-center">
                    <span className="flex gap-1 items-center">
                      <span className="w-3 h-3 bg-yellow-400 inline-block rounded-md"></span>Work
                    </span>
                    <span className="flex gap-1 items-center">
                      <span className="w-3 h-3 bg-gray-300 inline-block rounded-md"></span>Vacation
                    </span>
                    <span className="flex gap-1 items-center">
                      <span className="w-3 h-3 bg-red-300 inline-block rounded-md"></span>Sickness
                    </span>
                  </div>
                </div>

                {(
                  <div className="flex flex-col gap-4"> {/* vertical flex with spacing */}
                    <TodayInfoBox
                      dayType={infoBoxDayType}
                      events={selectedEvents}
                      date={infoBoxDate}
                      doneMap={infoBoxDoneMap}
                      onToggleDone={handleToggleDone}
                      isToday={isToday}
                      isSelected={true}
                      onDayTypeChange={handleDayTypeChange}
                      onAddEvent={(taskStr: string) => {
                        handleAddTaskWithLabel(taskStr, pendingClass || undefined);
                      }}
                      onRemoveEvent={enhancedHandleRemoveEvent}
                      onAddTasks={(tasks: string[]) => {
                        tasks.forEach(task =>
                          handleAddTaskWithLabel(task, pendingClass || undefined)
                        );
                      }}
                    />

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Task Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ClassManager
                          classes={classes}
                          onAddClass={handleAddClass}
                          onDeleteClass={handleDeleteClass}
                        />
                        <AddTaskSection
                          availableLabels={classes}
                          onAddTask={handleAddTaskWithLabel}
                        />
                      </CardContent>
                    </Card>
                  </div>

                )}
              </CardContent>
            </Card>

            {/* Stats Dashboard */}
            <DashboardStatsCard
              stats={[
                {
                  title: selectedDay
                    ? `Selected (${selectedDay.toLocaleDateString()})`
                    : `Today (${today.toLocaleDateString()})`,
                  stat: selectedStats, // Now counts ALL tasks (with or without label)
                  color: "#2ecc40",
                },
                {
                  title: `Month (${(selectedDay ?? today).toLocaleString(undefined, {
                    month: "long",
                    year: "numeric",
                  })})`,
                  stat: thisMonthStats,
                  color: "#ffd600",
                },
                {
                  title: `Year (${(selectedDay ?? today).getFullYear()})`,
                  stat: thisYearStats,
                  color: "#ffd600",
                },
              ]}
            />
            <LabelStatsSection classStats={classStats} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;

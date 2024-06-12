*Started from [microbundle-template](https://github.com/ivandotv/microbundle-template)*

# ActivityLog
Library with basic functionality for text-based activity logging

## Purpose
The goal is to create a system based on simple text documents, in which the editor GUI's autocompletion feature is employed to
facilitate and simplify data entry.

The autocomplete feature will
* suggest which activity to log next
* suggest what the "configuration" of the activity should be
* help writing the data in a way that can easily be understood by the system

## Examples
A repository with pre-defined activity types can be plugged in, e.g.
```
Running
location:X dist:X km time:X mins weights:X kg
```

When starting a new document (or a new paragraph within a document), autocomplete will propose activities that have previously been logged for the user,
or pre-defined activities.

These suggestions can be either full data sets (again, based on previous activities), or a basic template for the activity type.

New comments or measurements can always be added to an activity log item. E.g. if we have this  
![with icons replacing the measurement labels](/docs/resources/actitivty_01.png)  
the next autocomplete proposal will be `🏋️‍♀️ (weights, kg)`

Comments can always be added anywhere; to the activity as a whole, or as modifiers to measurements.  
![comment/modifier to the time measurement](/docs/resources/activity_01_comment.png)  

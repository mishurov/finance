# /**************************************************************************
#
#  This file is part of the Mishurov Finance website
#
#  Copyright (C) 2021 Alexander Mishurov
#
#  GNU General Public License Usage
#  This file may be used under the terms of the GNU
#  General Public License version 3. The licenses are as published by
#  the Free Software Foundation and appearing in the file LICENSE.GPL3
#  included in the packaging of this file. Please review the following
#  information to ensure the GNU General Public License requirements will
#  be met: https://www.gnu.org/licenses/gpl-3.0.html.
#
# **************************************************************************/

from django.contrib import admin
from django.forms import ModelForm
from django.forms.widgets import TextInput
from ..models.concrete import TextItem, FinancialVisual


@admin.register(TextItem)
class TextItemAdmin(admin.ModelAdmin):
    list_display = ('key', 'page')
    search_fields = ['key', 'page', 'text']


class FinancialVisualForm(ModelForm):
    class Meta:
        model = FinancialVisual
        fields = '__all__'
        widgets = {
            'primary_color1': TextInput(attrs={'type': 'color'}),
            'primary_color2': TextInput(attrs={'type': 'color'}),
            'secondary_color': TextInput(attrs={'type': 'color'}),
        }


@admin.register(FinancialVisual)
class FinancialVisualAdmin(admin.ModelAdmin):
    search_fields = ['name']
    list_display = ('name', 'key', 'type', 'visible')
    form = FinancialVisualForm
